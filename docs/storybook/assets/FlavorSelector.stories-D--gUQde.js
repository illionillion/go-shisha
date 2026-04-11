import{r as v,j as l}from"./iframe-D1P1EEeX.js";import{F as i}from"./FlavorSelector-GWcdJQYk.js";import"./preload-helper-PPVm8Dsz.js";import"./clsx-B-dksMZM.js";import"./FlavorLabel-BNOkLGXT.js";const e=[{id:1,name:"ミント",color:"bg-green-500"},{id:2,name:"ベリー",color:"bg-red-500"},{id:3,name:"グレープ",color:"bg-purple-500"},{id:4,name:"レモン",color:"bg-yellow-500"},{id:5,name:"オレンジ",color:"bg-orange-500"},{id:6,name:"ブルーベリー",color:"bg-indigo-500"}],f={title:"Features/Posts/FlavorSelector",component:i,parameters:{layout:"padded"},tags:["autodocs"],argTypes:{flavors:{description:"フレーバー一覧（GET /api/v1/flavors から取得）"},selectedFlavorId:{description:"選択されたフレーバーのID"},onSelect:{description:"フレーバー選択時のコールバック",action:"selected"},error:{description:"エラーメッセージ"},disabled:{description:"無効化状態"},className:{description:"カスタムクラス名"}},decorators:[n=>l.jsx("div",{style:{maxWidth:"600px"},children:l.jsx(n,{})})]},r={args:{flavors:e,selectedFlavorId:void 0,onSelect:()=>{}}},o={args:{flavors:e,selectedFlavorId:1,onSelect:()=>{}}},s={args:{flavors:e,selectedFlavorId:2,onSelect:()=>{}}},a={args:{flavors:e,selectedFlavorId:void 0,error:"フレーバーの選択に失敗しました",onSelect:()=>{}}},t={args:{flavors:e,selectedFlavorId:1,disabled:!0,onSelect:()=>{}}},c={args:{flavors:[],selectedFlavorId:void 0,onSelect:()=>{}}},d={render:n=>{const[p,m]=v.useState(n.selectedFlavorId);return l.jsx(i,{...n,selectedFlavorId:p,onSelect:m})},args:{flavors:e,selectedFlavorId:void 0,onSelect:()=>{}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    flavors: mockFlavors,
    selectedFlavorId: undefined,
    onSelect: () => {}
  }
}`,...r.parameters?.docs?.source},description:{story:"デフォルト状態（未選択）",...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    flavors: mockFlavors,
    selectedFlavorId: 1,
    onSelect: () => {}
  }
}`,...o.parameters?.docs?.source},description:{story:"フレーバー選択済み（ミント）",...o.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    flavors: mockFlavors,
    selectedFlavorId: 2,
    onSelect: () => {}
  }
}`,...s.parameters?.docs?.source},description:{story:"フレーバー選択済み（ベリー）",...s.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    flavors: mockFlavors,
    selectedFlavorId: undefined,
    error: "フレーバーの選択に失敗しました",
    onSelect: () => {}
  }
}`,...a.parameters?.docs?.source},description:{story:"エラー状態",...a.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    flavors: mockFlavors,
    selectedFlavorId: 1,
    disabled: true,
    onSelect: () => {}
  }
}`,...t.parameters?.docs?.source},description:{story:"無効化状態（ローディング中等）",...t.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    flavors: [],
    selectedFlavorId: undefined,
    onSelect: () => {}
  }
}`,...c.parameters?.docs?.source},description:{story:"フレーバーなし（空配列）",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [selectedFlavorId, setSelectedFlavorId] = useState<number | undefined>(args.selectedFlavorId);
    return <FlavorSelector {...args} selectedFlavorId={selectedFlavorId} onSelect={setSelectedFlavorId} />;
  },
  args: {
    flavors: mockFlavors,
    selectedFlavorId: undefined,
    onSelect: () => {}
  }
}`,...d.parameters?.docs?.source},description:{story:`インタラクティブデモ（選択状態を管理）
ユーザーが実際にフレーバーを選択・選択解除できる`,...d.parameters?.docs?.description}}};const y=["Default","SelectedMint","SelectedBerry","WithError","Disabled","NoFlavors","Interactive"];export{r as Default,t as Disabled,d as Interactive,c as NoFlavors,s as SelectedBerry,o as SelectedMint,a as WithError,y as __namedExportsOrder,f as default};
