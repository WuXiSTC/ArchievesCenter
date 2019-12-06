/**
 * wchain-一个流式中间件调用框架
 * TODO:文档——建议的中间件定义方法：使用一个函数返回中间件，固定的参数放外层函数，运行时变动的参数用meta传递*/

const events = require("events");
const StreamFaucet = require("./StreamFaucet");
const {Readable} = require("stream");
const OptionList = require("./OptionList");

/**
 * 构造函数，构造一个wchain变量
 * wchain既可以单独调用，也可以作为wchain的中间件（函数）
 * @param options wchain构造设置
 * @returns {Function}
 */
module.exports = function (options = OptionList) {

    for (let key in OptionList)//统一设置
        if (options[key] === undefined)
            options[key] = OptionList[key];

    let wchain = null;

    if (options.isolate_emitter) {//如果使用隔绝模式
        /**
         * 以中间件函数模式定义的隔绝模式wchain
         * 隔绝模式的wchain其内部触发的事件不会传递到外层中间件
         * @param meta 立即返回的元数据
         * @param stream 输入流
         * @param next 调用下一个中间件的函数
         */
        wchain = (meta, stream, next) => {
            //则使用内部定义的单独事件触发器（触发器的定义在下面）
            wchain.run(meta, stream, next);//运行
        };

        wchain.emitter = new events.EventEmitter();//事件触发器
        /**
         * 隔绝模式下的事件监听：直接调用事件触发器的on添加监听器即可
         * @param event 要监听的事件
         * @param callback 事件回调
         */
        wchain.on = (event, callback) => {
            wchain.emitter.on(event, callback);
        };
    } else {//如果不使用隔绝模式
        //在非隔绝模式下，需要记录所有定义的监听器，在wchain()调用时才加入到外面来的那个emitter中
        //并且设置监听器时emitter可能还都没定义（在wchain()调用时才定义）

        let eventList = {};

        /**
         * 局部函数emitterCopy，用在wchain()中，把一系列事件从eventList复制到emitter上
         * @param eventList 从何处复制event，格式为{"enentName":[callback,...],...}
         * @param emitter 复制到哪个EventEmitter
         */
        function emitterCopy(eventList, emitter) {
            for (let event in eventList) {
                let callbacks = eventList[event];
                for (let callback of callbacks)
                    emitter.on(event, callback);
            }
        }

        /**
         * 以中间件函数模式定义的非隔绝模式wchain
         * 隔绝模式的wchain其内部触发的事件会传递到外层中间件，调用时需要从外部传入一个emitter
         * @param meta 立即返回的元数据
         * @param stream 输入流
         * @param next 调用下一个中间件的函数
         * @param emitter 从外部传入emitter，wchain的内部事件将在这个emitter上触发
         */
        wchain = (meta, stream, next, emitter) => {
            wchain.emitter = emitter;//那就使用外部wchain传进来的事件触发器
            if (!emitter) {//如果在非隔绝模式下却没有传递emitter参数
                console.warn("您使用了隔绝模式，却没有向wchain()传递emitter参数，emitter将被重新定义，进入隔绝模式");
                wchain.emitter = new events.EventEmitter();//则重新定义emitter并报警告
            }
            emitterCopy(eventList, wchain.emitter);
            wchain.run(meta, stream, next);//运行
        };

        /**
         * 非隔绝模式下的事件监听：记录所有定义的监听器，在调用wchain()时统一读取并加入到外部emitter上
         * @param event 要监听的事件
         * @param callback 事件回调
         */
        wchain.on = (event, callback) => {
            if (eventList[event] instanceof Array)
                eventList[event].push(callback);
            else eventList[event] = [callback];
        };
    }

    /**
     * 触发某个事件
     * @param event 要触发的事件
     * @param args 要触发的payload
     */
    wchain.emit = (event, ...args) => {
        wchain.emitter.emit(event, ...args)
    };


    let middlewares = [];//中间件列表

    /**
     * 添加一个中间件，中间件将按use的先后顺序被调用
     * 中间件的格式是一个函数function(meta, stream, next, emitter)
     * 函数参数
     * meta 立即返回的元数据
     * stream 输入流
     * next 调用下一个中间件的函数
     * emitter 从外部传入emitter，用于触发事件
     *
     * @param middleware 要添加的中间件
     */
    wchain.use = (middleware) => {
        middlewares.push(middleware)
    };

    /**
     * 运行wchain，即按顺序调用前面wchain.use添加的中间件
     * @param meta 输入立即返回的元数据
     * @param stream 输入流
     * @param next 最后一个中间件的next参量
     */
    wchain.run = (meta, stream, next = () => null) => {
        //运行，按use的先后顺序调用中间件并传递触发器，其中的meta立即返回
        //chain是用于组装中间件调用链的循环变量
        let chain = next;//调用链的末尾是下一个调用链
        for (let i = middlewares.length - 1; i >= 0; i++) {
            //从调用链的末尾开始依次构造调用链（一级一级地定义流的流动顺序）
            let middleware = middlewares[i];
            chain = (processedStream) => {
                if (options.pause_at_begin && processedStream instanceof Readable) {//如果需要在一开始就停止
                    //那就在每一层中间加一个暂停的水龙头
                    let faucet = new StreamFaucet();
                    faucet.pause();
                    processedStream.pipe(faucet);
                    processedStream = faucet;
                }
                middleware(meta, processedStream, chain, wchain.emitter);
            }
        }
        chain(stream);
    };

    return wchain
};