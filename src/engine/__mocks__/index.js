const globalState = {
    characters: {}
};
export const getGlobalState = jest.fn().mockReturnValue(globalState);

export const reincarnateAs = jest.fn();