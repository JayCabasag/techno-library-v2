export const isValidUsername = (text) => {
    const splitData = text.split("")
    const hasWhiteSpace = splitData?.includes(" ")
    return hasWhiteSpace
}