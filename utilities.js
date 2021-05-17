import { DOMSerializer } from 'prosemirror-model'
import { TextSelection } from 'prosemirror-state'
import tippy, { hideAll } from 'tippy.js'

import { removeRange, setRange, setRangeEditingState } from './commands.js'

/**
 * 
 * @param {prosemirror-node} node 
 * @param {boolean} descend 
 * @returns {Array}
 * 
 * Used to flatten a tree of prosemirror nodes.
 */
function flattenNode (node, descend = true) {
    if (!node) {
      throw new Error('Invalid "node" parameter')
    }
    const result = []
    node.descendants((child, pos) => {
        result.push({ node: child, pos })
        if (!descend) {
            return false
        }
    })
    return result
}

/**
 * 
 * @param {Array} nodes 
 * @param {String} markName 
 * @param {String} attrId 
 * @returns {Object}
 * 
 * Used to extract mark positions of marks with a common attribute.
 * It takes a flattened prosemirror-node list including node positions and returns
 * an Object of mark positions { from, to } with the same attribute.
 */
const getMarks = (nodes, markName, attrId) => {
    let marks = {}
    nodes.forEach(({node, pos}) => {
        node.marks
            .filter(mark => mark.type.name === markName)
            .forEach(mark => {
                let storedMark = marks[mark.attrs[attrId]]
                if (!storedMark) {
                    storedMark = { marks: [] }
                    storedMark.from = pos
                    marks[mark.attrs[attrId]] = storedMark
                }
                storedMark.to = pos + node.nodeSize
                storedMark.isConfirmed = mark.attrs.isConfirmed
                storedMark.rangeId = mark.attrs[attrId]
                storedMark.marks = [...storedMark.marks, { from: pos, to: storedMark.to }]
            })
    })
    return marks
}


/**
 * 
 * @param {Object} ranges 
 * @param {Object} cmpRanges 
 * @returns {Boolean}
 * 
 * Checks if two range objects are equal ({ <id>: { from, to }, <id>: { from, to }}).
 */
const rangesEqual = (ranges, cmpRanges) => {
    const keysEqual = Object.keys(ranges).filter(key => cmpRanges[key]).length === Object.keys(ranges).length
    if (!keysEqual) {
        return false
    }

    const cmpKeysEqual = Object.keys(cmpRanges).filter(key => ranges[key]).length === Object.keys(cmpRanges).length
    if (!cmpKeysEqual) {
        return false
    }

    const positionsEqual = Object.entries(ranges).filter(([key, val]) => {
        const cmpRange = cmpRanges[key]
        return cmpRange.from === val.from && cmpRange.to === val.to && cmpRange.isConfirmed === val.isConfirmed
    }).length === Object.keys(ranges).length
    if (!positionsEqual) {
        return false
    }

    return true
}


/**
 * 
 * @param {prosemirror-fragment} fragment 
 * @param {prosemirror-schema} schema 
 * @returns {String}
 * 
 * Used to extract HTML content of a prosemirror fragment.
 */
const serializeFragment = (fragment, schema) => {
    let container = document.createElement('div')
    return DOMSerializer.fromSchema(schema).serializeFragment(fragment, {document: window.document}, container)
}

/**
 * 
 * @param {Object} range 
 * @param {prosemirror-state} state 
 * @param {prosemirror-schema} schema
 * @returns {String}
 * 
 * Extracts the HTML content of a from - to range ({ from: <int>, to: <int> }) from the given prosemirror state.
 */
const serializeRange = (range, state, schema) => {
    const { doc } = state
    const { content } = doc.slice(range.from, range.to)
    return serializeFragment(content, schema).innerHTML
}

/**
 * 
 * @param {Number} from 
 * @param {Number} to 
 * @param {prosemirror-node} doc 
 * @returns {Boolean}
 * 
 * Checks if a potential range between the passed in positions would split an existing range in two parts.
 */
const splitsExistingRange = (from, to, doc) => {
    const existingMarks = getMarks(flattenNode(doc), 'range', 'rangeId')
    const doesSplit = Object.values(existingMarks).filter((mark) => from > mark.from && to < mark.to)
    return doesSplit.length !== 0
}

const getRangeExtend = (currentPosition, originalPosition, originalRange) => {
    const rangeStart = originalPosition === originalRange.from ? originalRange.to : originalRange.from
    const from = Math.min(rangeStart, currentPosition)
    const to = Math.max(rangeStart, currentPosition)
    return { from, to }
}

const range = (start, end, step = 1) => {
    let output = []
    if (typeof end === 'undefined') {
      end = start
      start = 0
    }
    for (let i = start; i < end; i += step) {
      output.push(i)
    }
    return output
}

const isSuperset = (set, subset) => {
    for (let elem of subset) {
        if (!set.has(elem)) {
            return false
        }
    }
    return true
}

/**
 * 
 * @param {prosemirror-view} view 
 * @param {Number} anchor 
 * @param {Number} head 
 * @returns {tippy-instance}
 * 
 * This creates a tippy tooltip menu which can be used to create a new range.
 */
const createCreatorMenu = (view, anchor, head) => {
    const btn = document.createElement('button')
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>'
    btn.setAttribute('class', 'menu-btn')
    btn.addEventListener('click', (e) => {
        e.preventDefault()
        const from = Math.min(anchor, head)
        const to = Math.max(anchor, head)
        setRange(view)(from, to, { rangeId: `${from}_${to}` })
        const { state, dispatch } = view
        let { tr } = state
        view.focus()
        tr = tr.setSelection(new TextSelection(state.doc.resolve(head)))
        dispatch(tr)
    })
    return tippy(view.dom, {
        duration: 0,
        arrow: false,
        theme: 'light-border',
        getReferenceClientRect: () => {
            const positions = view.coordsAtPos(head, -1)
            return {
                height: 10,
                width: 0,
                ...positions
            }
        },
        content: btn,
        interactive: true,
        trigger: 'manual',
        showOnCreate: true,
    })

}

/**
 * 
 * @param {prosemirror-view} view 
 * @param {prosemirror-pluginKey} rangerTrackerKey 
 * @param {prosemirror-pluginKey} rangeEditingManagerKey 
 * @param {String} rangeId 
 * @returns {HTMLElement}
 * 
 * This creates content for a bubble menu allowing to confirm, edit or delete ranges. 
 */
const createRangeMenu = (view, rangerTrackerKey, rangeEditingManagerKey, rangeId) => {
    const wrapper = document.createElement('div')
    const activeRange = rangerTrackerKey.getState(view.state)[rangeId]

    if (!activeRange.isConfirmed) {
        const confirmBtn = document.createElement('button')
        confirmBtn.setAttribute('class', 'menu-btn pr-5')
        confirmBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        confirmBtn.addEventListener('click', (e) => {
            e.preventDefault()
            setRange(view)(activeRange.from, activeRange.to, { rangeId, isActive: false, isConfirmed: true})
            hideAll()
        })
        wrapper.appendChild(confirmBtn)
    }

    const editBtn = document.createElement('button')
    editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>'
    editBtn.setAttribute('class', 'menu-btn pr-5')
    editBtn.addEventListener('click', (e) => {
        e.preventDefault()
        setRangeEditingState(view, rangerTrackerKey, rangeEditingManagerKey)(rangeId, true)
        hideAll()
    })
    wrapper.appendChild(editBtn)

    const deleteBtn = document.createElement('button')
    deleteBtn.setAttribute('class', 'menu-btn')
    deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>'
    deleteBtn.addEventListener('click', (e) => {
        e.preventDefault()
        const tr = removeRange(view.state, activeRange.from, activeRange.to)
        view.dispatch(tr)
        hideAll()
    })
    wrapper.appendChild(deleteBtn)

    return wrapper
}


export { flattenNode, getMarks, getRangeExtend, rangesEqual, splitsExistingRange, serializeRange, range, isSuperset, createCreatorMenu, createRangeMenu }




