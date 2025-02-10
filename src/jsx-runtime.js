// jsx-runtime.js
export const h = (tag, props, ...children) => {
    if (typeof tag === 'function') {
        return tag(props, children)
    }

    const element = document.createElement(tag)

    if (props) {
        for (const [key, value] of Object.entries(props)) {
            if (key === 'className') {
                element.setAttribute('class', value)
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.substring(2).toLowerCase(), value)
            } else {
                element.setAttribute(key, value)
            }
        }
    }

    children.forEach((child) => {
        if (typeof child === 'string' || typeof child === 'number') {
            element.appendChild(document.createTextNode(child))
        } else if (Array.isArray(child)) {
            element.append(...child)
        } else if (child instanceof Node) {
            element.appendChild(child)
        }
    })

    return element
}

export const Fragment = (props, children) => children
