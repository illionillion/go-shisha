import{F as t}from"./FlavorFilter-uP-6JAuQ.js";import"./iframe-DxdPCBdZ.js";import"./preload-helper-PPVm8Dsz.js";import"./clsx-B-dksMZM.js";import"./index-Ch8dL1xN.js";const g={title:"Features/Posts/FlavorFilter",component:t,parameters:{layout:"padded"},tags:["autodocs"],argTypes:{flavors:{description:"フレーバー一覧"},selectedFlavorIds:{description:"選択中のフレーバーID配列"},onFlavorToggle:{action:"flavor toggled",description:"フレーバー選択切り替えハンドラー"}}},s=[{id:1,name:"ミント",color:"bg-green-500"},{id:2,name:"アップル",color:"bg-red-500"},{id:3,name:"ベリー",color:"bg-purple-500"},{id:4,name:"マンゴー",color:"bg-yellow-500"},{id:5,name:"オレンジ",color:"bg-orange-500"},{id:6,name:"グレープ",color:"bg-indigo-500"}],r={tags:["vrt"],args:{flavors:s,selectedFlavorIds:[],onFlavorToggle:()=>{}}},o={tags:["vrt"],args:{flavors:s,selectedFlavorIds:[],onFlavorToggle:()=>{}}},e={tags:["vrt"],args:{flavors:s,selectedFlavorIds:[1,3],onFlavorToggle:()=>{}}},a={args:{flavors:[],selectedFlavorIds:[],onFlavorToggle:()=>{}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    flavors: mockFlavors,
    selectedFlavorIds: [],
    onFlavorToggle: () => {}
  }
}`,...r.parameters?.docs?.source},description:{story:"デフォルト（未選択）- VRT対象",...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    flavors: mockFlavors,
    selectedFlavorIds: [],
    onFlavorToggle: () => {}
  }
}`,...o.parameters?.docs?.source},description:{story:"インタラクティブ版 - 実際に選択・解除できる",...o.parameters?.docs?.description}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    flavors: mockFlavors,
    selectedFlavorIds: [1, 3],
    onFlavorToggle: () => {}
  }
}`,...e.parameters?.docs?.source},description:{story:"インタラクティブ版（初期選択あり）",...e.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    flavors: [],
    selectedFlavorIds: [],
    onFlavorToggle: () => {}
  }
}`,...a.parameters?.docs?.source},description:{story:"フレーバーが空の場合（非表示）- VRT対象",...a.parameters?.docs?.description}}};const p=["Default","Interactive","InteractiveWithInitialSelection","Empty"];export{r as Default,a as Empty,o as Interactive,e as InteractiveWithInitialSelection,p as __namedExportsOrder,g as default};
