const globalState = {
    characters: {},
    unlockedTraits: {}
};
export const getGlobalState = jest.fn().mockReturnValue(globalState);

export const reincarnateAs = jest.fn();