export const convertMicroAlgosToAlgos = (microAlgos: number) => {
    const algos = Math.floor(microAlgos / 1000000);
    return algos.toLocaleString();
  };
  