/**
 * js various public and business-independent tool methods
 */
/**
 * undefined null '' [] {} Empty
 * @param {*} obj
 * @return {boolean} is_empty
 */
export const isEmpty = (obj: any) => {
    let isEmpty = false
    if (obj === undefined || obj === null || obj === '') {
        isEmpty = true
    } else if (Array.isArray(obj) && obj.length === 0) {
        isEmpty = true
    } else if (obj.constructor === Object && Object.keys(obj).length === 0) {
        isEmpty = true
    }
    return isEmpty
}
export const isNotEmpty = (obj: any) => {
    return !isEmpty(obj)
}
export const isNotEmptyArray = (arr: any[]) => {
    return Array.isArray(arr) && !isEmpty(arr)
}
export const isFunction = (fun: any) => {
    return typeof fun === 'function'
}

/**
 * null,undefined,false Convert to ''
 * @param value
 * @param str
 * @return {*|string}
 */
export const toBlank = (value: any, str = '') => {
    return value || value === 0 ? value + '' : str
}

export const removeBlank = (str: string) => {
    let parseReg = /\s{2,}/g
    if (typeof str === 'string') {
        return str.replace(parseReg, ' ')
    }
    return str
}

export const percentCalc = (number: string | number, parentNumber: () => number) => {
    if (typeof number === 'string') {
        if (/^\d{1,2}%$/.test(number)) {
            return parseInt(number.substring(0, -1)) * 0.01 * parentNumber()
        } else {
            return parentNumber()
        }
    } else if (typeof number === 'number') {
        return number
    } else {
        return parentNumber()
    }
}

export const cssParser = {
    multiValue<T>(value: T | T[]) {
        let result: T[] = []
        if (Array.isArray(value)) {
            switch (value.length) {
                case 1:
                    result = [value[0], value[0], value[0], value[0]]
                    break
                case 2:
                    result = [value[0], value[1], value[0], value[1]]
                    break
                case 3:
                    result = [value[0], value[1], value[2], value[1]]
                    break
                case 4:
                default:
                    result = [...value]
                    break
            }
        } else {
            result = [value, value, value, value]
        }
        return result
    },
    border(str: string) {
        if (str) {
            let [width, color] = <any>str.split(/\s{1,}/g)
            width = parseInt(width)
            return { width, color }
        } else {
            return null
        }
    },
}

export const throttling = function (action: Function, delay: number) {
    let last = 0
    return function (...args: any[]) {
        let curr = +new Date()
        if (curr - last > delay) {
            action.apply(this, args)
            last = curr
        }
    }
}

export const debounce = function (method: Function, delay: number) {
    // Function anti-shake
    let timer = null
    return function (...args: any[]) {
        let context = this
        clearTimeout(timer)
        timer = setTimeout(function () {
            method.apply(context, args)
        }, delay)
    }
}
