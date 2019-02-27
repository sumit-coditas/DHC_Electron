export function compareData(obj, nextObj, keys) {
    if (!keys || !keys.length) {
        return false;
    }
    for (let i = 0; i < keys.length; i += 1) {
        if (JSON.stringify(obj[keys[i]]) !== JSON.stringify(nextObj[keys[i]])) {
            return true;
        }
    }
    return false;
}

export function getOptions(array = [], valueKey = '', labelKey = '') {
    return array.map((item) => {
        const option = {
            ...item,
            value: item[valueKey],
            label: item[labelKey],
            text: item[labelKey]
        };
        return option
    })
}