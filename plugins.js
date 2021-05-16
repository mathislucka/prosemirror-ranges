import { serializeRange, getMarks, flattenNode, rangesEqual, getRangeExtend, range, isSuperset, createCreatorMenu, createRangeMenu } from './utilities.js'
import { genEditingDecorations, setRange, removeRange, replaceMarkInRange, removeMarkByName, replaceRange } from './commands.js'
import { rangeMark, rangeSelectionMark } from './marks.js'
import { EditorState, Plugin, PluginKey, Selection, TextSelection } from 'prosemirror-state'
import { Schema } from 'prosemirror-model'
import tippy, { followCursor, hideAll } from 'tippy.js'

/**
 * 
 * @param {prosemirror-pluginKey} pluginKey 
 * @param {prosemirror-pluginKey} editingTrackerKey 
 * @param {prosemirror-command} setDecorations 
 * @param {prosemirror-pluginKey} rangeTrackerKey 
 * @returns {prosemirror-plugin}
 * 
 * This plugin manages the insertion of decorations indicating start and end points for a specific range.
 */
const editingDecorations = (pluginKey, editingTrackerKey, rangeTrackerKey, editToggleCallback = () => {}) => {
    return new Plugin({
        key: pluginKey,
        state: {
            init () {
                return {
                    isEditing: false,
                    decorations: null,
                    position: {}
                }
            },
            apply (tr, pluginState, _, newState) {
                const meta = tr.getMeta(pluginKey)
                const move = editingTrackerKey.getState(newState)

                if (meta && meta.editing) {
                    editToggleCallback(rangeTrackerKey.getState(newState)[meta.id], true)
                    const decos = genEditingDecorations(newState, meta.from, meta.to, meta.id)
                    return {
                        isEditing: true,
                        decorations: decos,
                        position: { from: meta.from, to: meta.to }
                    }
                } else if (meta && !meta.editing) {
                    editToggleCallback(rangeTrackerKey.getState(newState)[meta.id], false)
                    return {
                        isEditing: false,
                        decorations: pluginState.decorations.remove(pluginState.decorations.find(meta.from, meta.to)),
                        position: {}
                    }
                } else if (move) {
                    const currentRange = rangeTrackerKey.getState(newState)[move.id]
                    const selection = tr.selection
                    const rangeEnd = selection.$head.pos

                    const { from, to } = getRangeExtend(rangeEnd, move.pos, currentRange)
                    const activeDecoration = move.pos === currentRange.from ? 'from' : 'to'
                    return {
                        isEditing: true,
                        decorations: genEditingDecorations(newState, from, to, move.id, activeDecoration),
                        position: { from, to }
                    }
                } else {
                    return pluginState
                }
            }
        },
        props: {
            decorations (state) {
                return pluginKey.getState(state)['decorations']
            },
            handleDOMEvents: {
                click(view, e) {
                    let { target } = e
                    if (target.getAttribute('data-range-widget')) {
                        const id = target.getAttribute('data-range-widget')
                        const pos = parseInt(target.getAttribute('data-range-widget-pos'))
                        const { dispatch, state } = view

                        let tr = state.tr
                        tr = tr.setSelection(TextSelection.near(state.doc.resolve(pos)))
                        const range = rangeTrackerKey.getState(state)[id]
                        const origin = editingTrackerKey.getState(state)

                        if (origin) {
                            tr = tr.setMeta(editingTrackerKey, 'stop-editing')
                            tr = removeRange(view.state, range.from, range.to, tr)
                            const { from, to } = getRangeExtend(pos, origin.pos, range)
                            tr = replaceRange(view.state, from, to, { rangeId: origin.id, isActive: true }, tr)
                            tr = removeMarkByName(view.state, 'rangeselection', 'active', tr)
                            view.dispatch(tr)
                            const currentInner = document.querySelector(`span[data-range-widget-pos="${pos}"]`)
                            currentInner.classList.remove('range-decoration__inner--active')
                        } else {
                            tr = tr.setMeta(editingTrackerKey, { id: id, pos: pos, moving: true })
                            dispatch(tr)
                            setRange(view)(range.from, range.to, { rangeId: id, isActive: true, isMoving: true })
                        }
                        view.focus()
                    }
                    return true
                }
            }
        },
        appendTransaction (_, oldState, newState) {
            const position = pluginKey.getState(newState)['position']
            const move = editingTrackerKey.getState(newState)
            if (Object.keys(position).length && move) {
                let tr = removeMarkByName(newState, 'rangeselection', 'active')
                tr = replaceMarkInRange(newState, position.from, position.to, 'rangeselection', { active: true }, tr)
                return tr
            }
        }
    })
}

/**
 * 
 * @param {prosemirror-pluginKey} trackerKey 
 * @returns {prosemirror-plugin}
 * 
 * This plugin tracks which range is currently being edited.
 */
const editStateTracker = (trackerKey) => {
    return new Plugin({
        key: trackerKey,
        state: {
            init () {
                return null
            },
            apply (tr, pluginState) {
                const meta = tr.getMeta(trackerKey)
                let returnVal = pluginState
                if (meta) {
                    returnVal = meta === 'stop-editing' ? null : meta
                }
                return returnVal
            }
        }
    })
}

/**
 * 
 * @param {prosemirror-pluginKey} rangeTrackerKey 
 * @param {prosemirror-schema} schema 
 * @param {Function} rangeChangeCallback 
 * @returns {prosemirror-plugin}
 * 
 * This plugin holds the state of all ranges currently used in a specific prosemirror instance.
 * A callback function can be passed as an argument which will be called whenever the state updates.
 * The callback receives the old range state and the updated range state as arguments.
 */
const rangeTracker = (rangeTrackerKey, schema, rangeChangeCallback = () => {}) => {
    return new Plugin({
        key: rangeTrackerKey,
        state: {
            init (_, state) {
                const ranges = getMarks(flattenNode(state.doc), 'range', 'rangeId')
                return ranges
            },
            apply (_, pluginState, oldState, newState) {
                // if (oldState.doc.eq(newState.doc)) {
                //     return pluginState
                // }

                const ranges = getMarks(flattenNode(newState.doc), 'range', 'rangeId')
                const equal = ranges && pluginState && rangesEqual(pluginState, ranges)
                if (equal) {
                    return pluginState
                }

                if (!equal) {
                    Object.entries(ranges).forEach(([id, range]) => {
                        ranges[id]['txt'] = serializeRange(range, newState, schema)
                    })
                    rangeChangeCallback(pluginState, ranges)
                    return ranges
                }
            }
        }
    })
}


const bubbleMenu = (_, rangeEditingKey) => {
    let tippy = null

    return {
        update (view, oldState) {
            const { state } = view
            const { doc, selection } = state
            const isSame = oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection)
            if (isSame) {
                return
            }

            const { empty, from, to, $anchor, $head } = selection
            if (empty) {
                tippy?.destroy()
                tippy = null
                return
            }
    
            const existingRanges = rangeEditingKey.getState(state)
            let positionsCovered = []
            Object.values(existingRanges).forEach(({ from, to }) => positionsCovered.push(...range(from, to)))
            const selectedPositions = new Set(range(from, to))
            positionsCovered = new Set(positionsCovered)
            const isFullyCovered = isSuperset(positionsCovered, selectedPositions)
    
            if (isFullyCovered) {
                tippy?.destroy()
                tippy = null
                return
            }
            tippy?.destroy()
            tippy = createCreatorMenu(view, $anchor.pos, $head.pos)
        }
    }
}

const rangeCreator = (pluginKey, rangeEditingKey) => {
    return new Plugin({
        key: pluginKey,
        view: (view) => bubbleMenu(view, rangeEditingKey)
    })
}

let rangeBehaviourManager = (pluginKey, rangeEditingManagerKey, rangeTrackerKey) => {
    let linkElement = document.createElement('link')
        linkElement.setAttribute('rel', 'stylesheet')
        linkElement.setAttribute('type', 'text/css')
        linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent(''))
        document.getElementsByTagName('head')[0].appendChild(linkElement)

    return new Plugin({
        key: pluginKey,
        props: {
            handleDOMEvents: {
                mouseover (view, e) {
                    const { state } = view
                    const { empty } = state.selection
                    if (!rangeEditingManagerKey.getState(state).isEditing && empty) {
                        const { target } = e
                        if (target.getAttribute('data-range')) {
                            hideAll()
                            tippy(target, {
                                arrow: false,
                                theme: 'light-border',
                                content (ref) {
                                    const segmentId = ref.getAttribute('data-range')
                                    return createRangeMenu(view, rangeTrackerKey, rangeEditingManagerKey, segmentId)
                                },
                                allowHTML: true,
                                interactive: true,
                                appendTo: () => document.body,
                                showOnCreate: true,
                                onHidden: (instance) => {
                                    instance.destroy()
                                },
                                followCursor: 'initial',
                                duration: 1,
                                delay: 100,
                                placement: 'auto',
                                plugins: [followCursor]
                            })
                        }

                        const segmentId = target.getAttribute('data-range')
                        const css = segmentId ? `span[data-range="${segmentId}"] { background-color: bisque; }` : ''
                        linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent(css))
                    } else {
                        linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent(''))
                    }
                }
            }
        }
    })
}

const initRangePlugin = (schema, rangeChangeCallback, editToggleCallback) => {
    let marks = schema.spec.marks.addToStart('range', rangeMark)
    marks = marks.addToStart('rangeselection', rangeSelectionMark)
    const currentSchema = new Schema({
        nodes: schema.spec.nodes,
        marks: marks
    })

    const editingDecorationsKey = new PluginKey('editing-decorations')
    const rangeTrackerKey = new PluginKey('range-tracker')
    const editStateTrackerKey = new PluginKey('range-edit-state')
    const rangeCreatorKey = new PluginKey('range-creator')
    const rangeBehaviourPluginKey = new PluginKey('range-behaviour')

    const decoPlugin = editingDecorations(editingDecorationsKey, editStateTrackerKey, rangeTrackerKey, editToggleCallback)
    const editStatePlugin = editStateTracker(editStateTrackerKey)
    const rangeTrackerPlugin = rangeTracker(rangeTrackerKey, currentSchema, rangeChangeCallback)
    const rangeCreatorPlugin = rangeCreator(rangeCreatorKey, rangeTrackerKey)
    const rangeBehaviourPlugin = rangeBehaviourManager(rangeBehaviourPluginKey, editingDecorationsKey, rangeTrackerKey)

    return {
        plugins: [ editStatePlugin, rangeTrackerPlugin, decoPlugin, rangeCreatorPlugin, rangeBehaviourPlugin ],
        schema: currentSchema,
        keys: {
            rangeTrackerKey,
            editStateTrackerKey,
            editingDecorationsKey,
            rangeCreatorKey
        }
    }
}

export { initRangePlugin }