import{j as s}from"./iframe-BnilshMK.js";import{P as t}from"./PostCreateForm-BGlZRUrl.js";import"./preload-helper-PPVm8Dsz.js";import"./clsx-B-dksMZM.js";import"./index-BNi5uvoB.js";import"./ImageUploader-C95pQE-6.js";import"./FlavorSelector-Crsyno8W.js";import"./FlavorLabel-CFSAtfcI.js";const l=[{id:1,name:"ミント",color:"bg-green-500"},{id:2,name:"アップル",color:"bg-yellow-500"},{id:3,name:"グレープ",color:"bg-purple-500"},{id:4,name:"レモン",color:"bg-orange-500"},{id:5,name:"ストロベリー",color:"bg-red-500"}],h={title:"Features/Posts/PostCreateForm",component:t,parameters:{layout:"fullscreen"},tags:["autodocs"],argTypes:{onSubmit:{action:"submit"},onCancel:{action:"cancel"}}},e={args:{flavors:l,onSubmit:async o=>{console.log("Submit:",o)},onCancel:()=>{console.log("Cancel")}},tags:["vrt","vrt-sp"],decorators:[o=>s.jsx("div",{className:"h-screen w-full bg-gray-50 p-4",children:s.jsx("div",{className:"mx-auto h-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg",children:s.jsx(o,{})})})]},r={args:{flavors:[],onSubmit:async o=>{console.log("Submit:",o)},onCancel:()=>{console.log("Cancel")}},tags:["vrt","vrt-sp"],decorators:[o=>s.jsx("div",{className:"h-screen w-full bg-gray-50 p-4",children:s.jsx("div",{className:"mx-auto h-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg",children:s.jsx(o,{})})})]},a={args:{flavors:l,disabled:!0,onSubmit:async o=>{console.log("Submit:",o)},onCancel:()=>{console.log("Cancel")}},tags:["vrt","vrt-sp"],decorators:[o=>s.jsx("div",{className:"h-screen w-full bg-gray-50 p-4",children:s.jsx("div",{className:"mx-auto h-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg",children:s.jsx(o,{})})})]},n={args:{flavors:l,maxFiles:3,onSubmit:async o=>{console.log("Submit:",o)},onCancel:()=>{console.log("Cancel")}},tags:["vrt","vrt-sp"],decorators:[o=>s.jsx("div",{className:"h-screen w-full bg-gray-50 p-4",children:s.jsx("div",{className:"mx-auto h-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg",children:s.jsx(o,{})})})]};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    flavors: mockFlavors,
    onSubmit: async slides => {
      console.log("Submit:", slides);
    },
    onCancel: () => {
      console.log("Cancel");
    }
  },
  tags: ["vrt", "vrt-sp"],
  decorators: [Story => <div className="h-screen w-full bg-gray-50 p-4">
        <div className="mx-auto h-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
          <Story />
        </div>
      </div>]
}`,...e.parameters?.docs?.source},description:{story:"デフォルト表示（画像選択ステップ）",...e.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    flavors: [],
    onSubmit: async slides => {
      console.log("Submit:", slides);
    },
    onCancel: () => {
      console.log("Cancel");
    }
  },
  tags: ["vrt", "vrt-sp"],
  decorators: [Story => <div className="h-screen w-full bg-gray-50 p-4">
        <div className="mx-auto h-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
          <Story />
        </div>
      </div>]
}`,...r.parameters?.docs?.source},description:{story:"フレーバーなし",...r.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    flavors: mockFlavors,
    disabled: true,
    onSubmit: async slides => {
      console.log("Submit:", slides);
    },
    onCancel: () => {
      console.log("Cancel");
    }
  },
  tags: ["vrt", "vrt-sp"],
  decorators: [Story => <div className="h-screen w-full bg-gray-50 p-4">
        <div className="mx-auto h-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
          <Story />
        </div>
      </div>]
}`,...a.parameters?.docs?.source},description:{story:"無効状態（投稿中）",...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    flavors: mockFlavors,
    maxFiles: 3,
    onSubmit: async slides => {
      console.log("Submit:", slides);
    },
    onCancel: () => {
      console.log("Cancel");
    }
  },
  tags: ["vrt", "vrt-sp"],
  decorators: [Story => <div className="h-screen w-full bg-gray-50 p-4">
        <div className="mx-auto h-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
          <Story />
        </div>
      </div>]
}`,...n.parameters?.docs?.source},description:{story:"ファイル数制限（最大3枚）",...n.parameters?.docs?.description}}};const b=["Default","NoFlavors","Disabled","LimitedFiles"];export{e as Default,a as Disabled,n as LimitedFiles,r as NoFlavors,b as __namedExportsOrder,h as default};
