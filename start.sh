#! /bin/bash

if [ -n "${GLUSTERFS_SERVER_ADDR}" ]; then
    #如果设置了GLUSTERFS_SERVER_ADDR那就开始进行GlusterFS的配置

    if [ ! -n "${GLUSTERFS_VOLUME}" ]; then
        #首先设置GLUSTERFS_VOLUME
        export GLUSTERFS_VOLUME="/"
        echo "GLUSTERFS_VOLUME was set to default value: ${GLUSTERFS_VOLUME}"
    fi

    if [ ! -n "${GLUSTERFS_MOUNTDIR}" ]; then
        #然后设置GLUSTERFS_MOUNTDIR
        export GLUSTERFS_MOUNTDIR="/data"
        echo "GLUSTERFS_MOUNTDIR was set to default value: ${GLUSTERFS_MOUNTDIR}"
    fi

    #然后启动GlusterFS
    echo "GlusterFS will start. Gluster volume ${GLUSTERFS_VOLUME} from server ${GLUSTERFS_SERVER_ADDR} will be mounted to ${GLUSTERFS_MOUNTDIR}"
    mount -t glusterfs ${GLUSTERFS_SERVER_ADDR}:${GLUSTERFS_VOLUME} ${GLUSTERFS_MOUNTDIR}
else
    #否则不启动GlusterFS
    echo "GLUSTERFS_SERVER_ADDR was not set, GlusterFS will not start."
fi

if [ ! -n "${DATA_DIR}" ]; then
    #然后设置DATA_DIR
    DATA_DIR="${GLUSTERFS_VOLUME}"
    echo "DATA_DIR was set to default value: ${GLUSTERFS_VOLUME}"
fi

echo "Your uploaded files will stored in ${DATA_DIR}"
cd ${APP_DIR}
npm start --dir=${DATA_DIR}
