FROM yindaheng98/node-glusterfs

ENV APP_DIR /app
ENV DATA_DIR /data

ADD ./ ${APP_DIR}
WORKDIR ${APP_DIR}

RUN npm install

EXPOSE 3000

RUN mkdir ${DATA_DIR} && chmod a+rw ${DATA_DIR}
VOLUME [ ${DATA_DIR} ]

CMD [ ${APP_DIR}/start.sh ]