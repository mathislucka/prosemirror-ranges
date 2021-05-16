import './style.css'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light-border.css'

import { DOMParser } from 'prosemirror-model'
import {EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import {schema} from 'prosemirror-schema-basic'
import {exampleSetup} from 'prosemirror-example-setup'
import { initRangePlugin } from './plugins.js'
import { setRange, setRangeEditingState } from './commands.js'


let rangeEdited = null
const rangeCall = (_, newState) => {
    if (rangeEdited) {
        document.querySelector('pre').textContent = JSON.stringify(newState[rangeEdited], null, 2)
    }
}
const editToggleCallback = (range, isEditing) => {
    if (range && isEditing) {
        rangeEdited = range.rangeId
        document.querySelector('.edit-container').classList.remove('display--none')
        const el = document.querySelector('#json')
        const pre = document.createElement('pre')
        pre.textContent = JSON.stringify(range, null, 2)
        el.appendChild(pre)
        document.querySelector('.edit-container button').addEventListener('click', () => {
            window.setRangeEditingState(range.rangeId, false)
            el.innerHTML = ''
        })
    } else {
        rangeEdited = null
        document.querySelector('.edit-container').classList.add('display--none')
    }
}
const rangePlugin = initRangePlugin(schema, rangeCall, editToggleCallback)
let view = window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(rangePlugin.schema).parse(document.querySelector("#content")),
    plugins: exampleSetup({schema: rangePlugin.schema}).concat(...rangePlugin.plugins)
  })
})

window.setRange = setRange(view)
window.setRangeEditingState = setRangeEditingState(view, rangePlugin.keys.rangeTrackerKey, rangePlugin.keys.editingDecorationsKey)



