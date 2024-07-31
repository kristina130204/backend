const isFieldEmpty = (value: string) => {
  if (value.length === 0) {
    return true;
  }
  return false;
};

export { isFieldEmpty };
