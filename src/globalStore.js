import { spy, getDependencyTree, $mobx } from "mobx"
import { componentByNodeRegistery } from "mobx-react"
import EventEmmiter from "events"
import deduplicateDependencies from "./deduplicateDependencies"
import consoleLogChange from "./consoleLogChange"

const mobxAdminProperty = $mobx || "$mobx"

const LS_UPDATES_KEY = "mobx-react-devtool__updatesEnabled"
const LS_LOG_KEY = "mobx-react-devtool__logEnabled"

let state = {
    updatesEnabled: false,
    graphEnabled: false,
    logEnabled: false,
    hoverBoxes: [],
    renderingBoxes: [],
    logFilter: () => true
}

export const eventEmitter = new EventEmmiter()

eventEmitter.setMaxListeners(Infinity)

let loggerDisposer

export const setGlobalState = newState => {
    if (state.logEnabled !== newState.logEnabled) {
        if (newState.logEnabled === true) {
            if (loggerDisposer) loggerDisposer()
            loggerDisposer = spy(change => consoleLogChange(change, state.logFilter))
        } else if (newState.logEnabled === false && loggerDisposer) {
            loggerDisposer()
        }
    }

    if (typeof window !== "undefined" && window.localStorage) {
        if (newState.updatesEnabled === true) {
            window.localStorage.setItem(LS_UPDATES_KEY, "YES")
        } else if (newState.updatesEnabled === false) {
            window.localStorage.removeItem(LS_UPDATES_KEY)
        }
        if (newState.logEnabled === true) {
            window.localStorage.setItem(LS_LOG_KEY, "YES")
        } else if (newState.logEnabled === false) {
            window.localStorage.removeItem(LS_LOG_KEY)
        }
    }

    if (newState.graphEnabled === false) {
        newState.hoverBoxes = []
    }

    state = Object.assign({}, state, newState)

    eventEmitter.emit("update")
}

export const getGlobalState = () => state

export const restoreUpdatesFromLocalstorage = () => {
    if (typeof window !== "undefined" && window.localStorage) {
        const updatesEnabled = window.localStorage.getItem(LS_UPDATES_KEY) === "YES"
        setGlobalState({ updatesEnabled })
    }
}
export const restoreLogFromLocalstorage = () => {
    if (typeof window !== "undefined" && window.localStorage) {
        const logEnabled = window.localStorage.getItem(LS_LOG_KEY) === "YES"
        setGlobalState({ logEnabled })
    }
}

const findComponentAndNode = target => {
    let node = target
    let component
    while (node) {
        component = componentByNodeRegistery.get(node)
        if (component) return { component, node }
        node = node.parentNode
    }
    return { component: undefined, node: undefined }
}

export const _handleMouseMove = e => {
    if (state.graphEnabled) {
        const target = e.target
        const node = findComponentAndNode(target).node
        if (node) {
            const coordinates = node.getBoundingClientRect()
            setGlobalState({
                hoverBoxes: [
                    {
                        id: "the hovered node",
                        type: "hover",
                        x: coordinates.left,
                        y: coordinates.top,
                        width: coordinates.width,
                        height: coordinates.height,
                        lifeTime: Infinity
                    }
                ]
            })
        }
    }
}

export const _handleClick = e => {
    if (state.graphEnabled) {
        const target = e.target
        const component = findComponentAndNode(target).component
        if (component) {
            e.stopPropagation()
            e.preventDefault()
            const dependencyTree = getDependencyTree(component.render[mobxAdminProperty])
            deduplicateDependencies(dependencyTree)
            setGlobalState({
                dependencyTree,
                hoverBoxes: [],
                graphEnabled: false
            })
        }
    }
}
