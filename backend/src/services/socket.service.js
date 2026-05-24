let ioInstance = null;

export const setIo = (io) => {
  ioInstance = io;
};

export const getIo = () => ioInstance;

export const emitAdminUpdate = (event, payload) => {
  if (!ioInstance) {
    return;
  }

  ioInstance.to("admins").emit(event, payload);
};
