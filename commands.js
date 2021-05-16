import { splitsExistingRange, flattenNode, getMarks, range } from './utilities.js'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { v4 as uuidv4 } from 'uuid'

/**
 * 
 * @param {prosemirror-state} state 
 * @param {Number} from 
 * @param {Number} to 
 * @param {Object} rangeAttrs
 * @param {prosemirror-transaction} tr
 * @returns {prosemirror-transaction}
 * 
 * Used to replace a range at the specified positions.
 */
const replaceRange = (state, from, to, rangeAttrs, tr=false) => {
    if (splitsExistingRange(from, to, state.doc)) {
        throw new Error('Ranges can not be split in two parts.')
    }

    return replaceMarkInRange(state, from, to, 'range', rangeAttrs, tr)
}

/**
 * 
 * @param {prosemirror-state} state 
 * @param {Number} from 
 * @param {Number} to 
 * @param {prosemirror-transaction} tr 
 * @returns {prosemirror-transaction}
 * 
 * Used to remove a range mark within the specified positions.
 */
const removeRange = (state, from, to, tr=false) => {
    const rangeMarkType = state.config.schema.marks.range
    let transaction = tr || state.tr
    transaction = transaction.removeMark(from, to, rangeMarkType)
    return transaction
}

/**
 * 
 * @param {prosemirror-state} state 
 * @param {String} markName 
 * @param {String} markAttr 
 * @param {prosemirror-transaction} tr 
 * @returns {prosemirror-transaction}
 * 
 * Used to remove all marks of the specified type.
 */
const removeMarkByName = (state, markName, markAttr, tr = false) => {
    const nodes = flattenNode(state.doc)
    const marks = getMarks(nodes, markName, markAttr)
    const transaction = tr || state.tr
    const markType = state.config.schema.marks[markName]
    Object.values(marks).forEach(mark => {
        const { from, to } = mark
        transaction.removeMark(from, to, markType)
    })
    return transaction
}

/**
 * 
 * Used to set the editing state of a range by id.
 */
const setRangeEditingState = (view, rangeTrackerKey, editingDecorationsKey) => (id, editingState) => {
    const { dispatch, state } = view
    const range = rangeTrackerKey.getState(state)[id]
    const { from, to, isConfirmed, rangeId } = range

    if (!range) {
        throw new Error ('Range not found')
    }

    let tr = replaceRange(state, from, to, { rangeId, isConfirmed, isActive: editingState,  })
    tr = tr.setMeta(editingDecorationsKey, { editing: editingState, from: range.from, to: range.to, id })
    dispatch(tr)
}

/**
 * 
 * @param {prosemirror-state} state 
 * @param {Number} from 
 * @param {Number} to 
 * @param {String} markKey 
 * @param {Object} markAttrs 
 * @returns {prosemirror-transaction}
 * 
 * This is used to replace a mark in a specific range with a new mark.
 */
const replaceMarkInRange = (state, from, to, markKey, markAttrs, tr = false) => {
    const pmId = uuidv4()
    const newAttrs = { ...markAttrs, pmId }
    const markType = state.config.schema.marks[markKey]
    let transaction = tr || state.tr
    transaction = transaction.removeMark(from, to, markType)
    const newMark = markType.create(newAttrs)
    transaction = transaction.addMark(from, to, newMark)
    const markCollection = getMarks(flattenNode(transaction.doc), markKey, 'pmId')
    const currentMarkCollection = markCollection[pmId]
    currentMarkCollection.marks.forEach(m => {
        transaction = transaction.removeMark(m.from, m.to, markType)
        const uniqueMark = markType.create({ ...newAttrs, pmId: uuidv4() })
        transaction = transaction.addMark(m.from, m.to, uniqueMark)
    })
    return transaction
}

/**
 * 
 * @param {prosemirror-view} view 
 * @returns {undefined}
 * 
 * This command sets a range. You can use it as a curried function either passing in the view first and calling it later with
 * from, to and id. Or you can call it like this: setRange(view)(1, 5, 'an id')
 */
const setRange = (view) => (from, to, rangeAttrs) => {
    const { state, dispatch } = view
    const tr = replaceRange(state, from, to, rangeAttrs)
    dispatch(tr)
}

/**
 * 
 * @param {String} id 
 * @param {Number} pos 
 * @returns {Node}
 * 
 * This is a utility function generating decoration elements which indicate start and end positions of a range currently being edited.
 */
const makeDecoration = (id, pos, isActive = false) => {
    const el = document.createElement('button')
    el.setAttribute('class', 'range-decoration__button')
    el.setAttribute('data-range-widget', id)
    el.setAttribute('data-range-widget-pos', pos)

    const inner = document.createElement('span')
    const innerClass = isActive ? 'range-decoration__inner range-decoration__inner--active' : 'range-decoration__inner'
    inner.setAttribute('class', innerClass)
    inner.setAttribute('data-range-widget', id)
    inner.setAttribute('data-range-widget-pos', pos)
    
    el.appendChild(inner)

    return el
}

/**
 * 
 * @param {prosemirror-state} state 
 * @param {Number} from 
 * @param {Number} to 
 * @param {String} id 
 * @returns {prosemirror-decoration-set}
 * 
 * This command is used to generate a set of decorations which signal start and end point for a specific range.
 */
const genEditingDecorations = (state, from, to, id, isActive) => {
    const start = Decoration.widget(from, makeDecoration(id, from, isActive === 'from'), { id })
    const end = Decoration.widget(to, makeDecoration(id, to, isActive === 'to'), { id })
    return DecorationSet.create(state.doc, [
        start,
        end
    ])
}


export {
    genEditingDecorations,
    setRange,
    setRangeEditingState,
    removeRange,
    replaceMarkInRange,
    removeMarkByName,
    replaceRange
}
