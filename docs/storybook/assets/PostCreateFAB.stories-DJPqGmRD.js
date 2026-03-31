import{j as e}from"./iframe-BnilshMK.js";import{P as o}from"./PostCreateFAB-DChVM56E.js";import"./preload-helper-PPVm8Dsz.js";import"./clsx-B-dksMZM.js";import"./index-BNi5uvoB.js";const m={title:"Features/Posts/PostCreateFAB",component:o,parameters:{layout:"fullscreen"},tags:["autodocs"],argTypes:{onClick:{action:"clicked"}}},s={args:{onClick:()=>{}},decorators:[r=>e.jsxs("div",{className:"relative h-screen bg-gray-100",children:[e.jsxs("div",{className:"p-8",children:[e.jsx("h1",{className:"text-2xl font-bold",children:"投稿作成FAB"}),e.jsx("p",{className:"mt-2 text-gray-600",children:"右下のプラスボタンをクリックしてください"})]}),e.jsx(r,{})]})]},a={args:{onClick:()=>{},"aria-label":"新しい投稿を作成"},decorators:[r=>e.jsx("div",{className:"relative h-screen bg-gray-100",children:e.jsx(r,{})})]},t={args:{onClick:()=>{}},decorators:[r=>e.jsxs("div",{className:"relative h-screen bg-gray-100",children:[e.jsx("div",{className:"p-8",children:e.jsx("p",{className:"text-gray-600",children:"ボタンにマウスをホバーすると、背景色が濃くなり影が大きくなります"})}),e.jsx(r,{})]})],parameters:{pseudo:{hover:!0}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    onClick: () => {}
  },
  decorators: [Story => <div className="relative h-screen bg-gray-100">
        <div className="p-8">
          <h1 className="text-2xl font-bold">投稿作成FAB</h1>
          <p className="mt-2 text-gray-600">右下のプラスボタンをクリックしてください</p>
        </div>
        <Story />
      </div>]
}`,...s.parameters?.docs?.source},description:{story:`デフォルト表示

画面右下に固定表示されるFABボタン`,...s.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    onClick: () => {},
    "aria-label": "新しい投稿を作成"
  },
  decorators: [Story => <div className="relative h-screen bg-gray-100">
        <Story />
      </div>]
}`,...a.parameters?.docs?.source},description:{story:"カスタムARIAラベル",...a.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    onClick: () => {}
  },
  decorators: [Story => <div className="relative h-screen bg-gray-100">
        <div className="p-8">
          <p className="text-gray-600">
            ボタンにマウスをホバーすると、背景色が濃くなり影が大きくなります
          </p>
        </div>
        <Story />
      </div>],
  parameters: {
    pseudo: {
      hover: true
    }
  }
}`,...t.parameters?.docs?.source},description:{story:"ホバー状態のプレビュー",...t.parameters?.docs?.description}}};const p=["Default","CustomAriaLabel","HoverState"];export{a as CustomAriaLabel,s as Default,t as HoverState,p as __namedExportsOrder,m as default};
