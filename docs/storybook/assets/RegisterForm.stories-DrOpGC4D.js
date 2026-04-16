import{j as e}from"./iframe-B5CsvR9o.js";import{u as x,a as f,r as h}from"./auth-BvPU7goI.js";import{c as s}from"./clsx-B-dksMZM.js";import{L as b}from"./link-CLU0D4zb.js";import"./preload-helper-PPVm8Dsz.js";const y=t=>{let r=0;return t.length>=12&&(r+=25),t.length>=16&&(r+=25),/[a-z]/.test(t)&&(r+=15),/[A-Z]/.test(t)&&(r+=15),/[0-9]/.test(t)&&(r+=10),/[^a-zA-Z0-9]/.test(t)&&(r+=10),Math.min(r,100)},w=({password:t})=>{const r=y(t),d=()=>r<40?"bg-red-500":r<70?"bg-yellow-500":"bg-green-500",m=()=>r<40?"弱い":r<70?"普通":"強い";return t?e.jsx("div",{className:s(["mt-2"]),children:e.jsxs("div",{className:s(["flex","items-center","gap-2"]),children:[e.jsx("div",{className:s(["h-2","flex-1","overflow-hidden","rounded-full","bg-gray-200"]),children:e.jsx("div",{className:s(["h-full","transition-all",d()]),style:{width:`${r}%`}})}),e.jsx("span",{className:s(["text-xs","text-gray-600"]),children:m()})]})}):null},c=({onSubmit:t,isLoading:r=!1,errorMessage:d,loginHref:m})=>{const{register:l,handleSubmit:p,watch:u,formState:{errors:a}}=x({resolver:f(h)}),g=u("password","");return e.jsxs("div",{className:s(["w-full","rounded-lg","bg-white","p-8","shadow-2xl"]),children:[e.jsx("h2",{className:s(["mb-6","text-2xl","font-bold"]),children:"登録"}),d&&e.jsx("div",{className:s(["mb-4","rounded-md","bg-red-50","p-3","text-sm","text-red-600"]),children:d}),e.jsxs("form",{onSubmit:p(t),className:s(["space-y-4"]),children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"email",className:s(["block","text-sm","font-medium","text-gray-700"]),children:"メールアドレス"}),e.jsx("input",{...l("email"),id:"email",type:"email",className:s(["mt-1","block","w-full","rounded-md","border","border-gray-300","px-3","py-2","shadow-sm","focus:border-purple-500","focus:outline-none","focus:ring-purple-500"]),placeholder:"your@email.com",disabled:r}),a.email&&e.jsx("p",{className:s(["mt-1","text-sm","text-red-600"]),children:a.email.message})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"displayName",className:s(["block","text-sm","font-medium","text-gray-700"]),children:"表示名"}),e.jsx("input",{...l("displayName"),id:"displayName",type:"text",className:s(["mt-1","block","w-full","rounded-md","border","border-gray-300","px-3","py-2","shadow-sm","focus:border-purple-500","focus:outline-none","focus:ring-purple-500"]),placeholder:"山田太郎",disabled:r}),a.displayName&&e.jsx("p",{className:s(["mt-1","text-sm","text-red-600"]),children:a.displayName.message})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"password",className:s(["block","text-sm","font-medium","text-gray-700"]),children:"パスワード"}),e.jsx("input",{...l("password"),id:"password",type:"password",className:s(["mt-1","block","w-full","rounded-md","border","border-gray-300","px-3","py-2","shadow-sm","focus:border-purple-500","focus:outline-none","focus:ring-purple-500"]),placeholder:"••••••••••••",disabled:r}),e.jsx(w,{password:g}),a.password&&e.jsx("p",{className:s(["mt-1","text-sm","text-red-600"]),children:a.password.message})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"confirmPassword",className:s(["block","text-sm","font-medium","text-gray-700"]),children:"パスワード（確認）"}),e.jsx("input",{...l("confirmPassword"),id:"confirmPassword",type:"password",className:s(["mt-1","block","w-full","rounded-md","border","border-gray-300","px-3","py-2","shadow-sm","focus:border-purple-500","focus:outline-none","focus:ring-purple-500"]),placeholder:"••••••••••••",disabled:r}),a.confirmPassword&&e.jsx("p",{className:s(["mt-1","text-sm","text-red-600"]),children:a.confirmPassword.message})]}),e.jsx("button",{type:"submit",disabled:r,className:s(["w-full","rounded-md","bg-purple-600","px-4","py-2","text-white","hover:bg-purple-700","disabled:cursor-not-allowed","disabled:opacity-50"]),children:r?"登録中...":"登録"}),e.jsxs("div",{className:s(["text-center","text-sm","text-gray-600"]),children:["既にアカウントをお持ちの方は",e.jsx(b,{href:m??"/login",className:s(["ml-1","text-purple-600","hover:underline"]),children:"こちら"})]})]})]})};c.__docgenInfo={description:`登録フォームコンポーネント

@description
メール・パスワード・確認・表示名を入力して登録するフォーム。
React Hook Form + zodによるバリデーション実装。
パスワード強度インジケーター付き。

@example
\`\`\`tsx
<RegisterForm
  onSubmit={async (data) => { await register(data); }}
  isLoading={false}
/>
\`\`\``,methods:[],displayName:"RegisterForm",props:{onSubmit:{required:!0,tsType:{name:"signature",type:"function",raw:"(data: RegisterInput) => Promise<void> | void",signature:{arguments:[{type:{name:"RegisterInput"},name:"data"}],return:{name:"union",raw:"Promise<void> | void",elements:[{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"},{name:"void"}]}}},description:"登録処理のコールバック"},isLoading:{required:!1,tsType:{name:"boolean"},description:"ローディング状態",defaultValue:{value:"false",computed:!1}},errorMessage:{required:!1,tsType:{name:"string"},description:"サーバーエラーメッセージ"},loginHref:{required:!1,tsType:{name:"string"},description:"ログインページへのリンク (redirectUrlを保持する場合に使用)"}}};const k={title:"Features/Auth/RegisterForm",component:c,parameters:{layout:"centered",docs:{description:{component:`登録フォームコンポーネント

メール・パスワード・確認・表示名を入力して登録するフォーム。
React Hook Form + zodによるバリデーション実装。
パスワード強度インジケーター付き。`}}},tags:["autodocs"],args:{onSubmit:()=>{}}},o={args:{isLoading:!1},tags:["vrt"]},n={args:{isLoading:!0},tags:["vrt"]},i={args:{isLoading:!1,errorMessage:"このメールアドレスは既に使用されています"},tags:["vrt"]};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    isLoading: false
  },
  tags: ["vrt"]
}`,...o.parameters?.docs?.source},description:{story:`デフォルト状態

通常の登録フォーム表示。`,...o.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    isLoading: true
  },
  tags: ["vrt"]
}`,...n.parameters?.docs?.source},description:{story:`ローディング状態

登録処理中の状態。ボタンが無効化され、テキストが変更されます。`,...n.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    isLoading: false,
    errorMessage: "このメールアドレスは既に使用されています"
  },
  tags: ["vrt"]
}`,...i.parameters?.docs?.source},description:{story:`エラー状態

サーバーエラーが発生した際の表示。`,...i.parameters?.docs?.description}}};const P=["Default","Loading","WithError"];export{o as Default,n as Loading,i as WithError,P as __namedExportsOrder,k as default};
