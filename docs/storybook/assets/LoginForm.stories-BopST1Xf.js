import{j as e}from"./iframe-DPD6zQMs.js";import{u,a as g,l as x}from"./auth-DgQP7cHk.js";import{c as r}from"./clsx-B-dksMZM.js";import{L as f}from"./link-BsWwqRxE.js";import"./preload-helper-PPVm8Dsz.js";const m=({onSubmit:l,isLoading:t=!1,errorMessage:i,registerHref:c})=>{const{register:d,handleSubmit:p,formState:{errors:n}}=u({resolver:g(x)});return e.jsxs("div",{className:r(["w-full","rounded-lg","bg-white","p-8","shadow-2xl"]),children:[e.jsx("h2",{className:r(["mb-6","text-2xl","font-bold"]),children:"ログイン"}),i&&e.jsx("div",{className:r(["mb-4","rounded-md","bg-red-50","p-3","text-sm","text-red-600"]),children:i}),e.jsxs("form",{onSubmit:p(l),className:r(["space-y-4"]),children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"email",className:r(["block","text-sm","font-medium","text-gray-700"]),children:"メールアドレス"}),e.jsx("input",{...d("email"),id:"email",type:"email",className:r(["mt-1","block","w-full","rounded-md","border","border-gray-300","px-3","py-2","shadow-sm","focus:border-purple-500","focus:outline-none","focus:ring-purple-500"]),placeholder:"your@email.com",disabled:t}),n.email&&e.jsx("p",{className:r(["mt-1","text-sm","text-red-600"]),children:n.email.message})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"password",className:r(["block","text-sm","font-medium","text-gray-700"]),children:"パスワード"}),e.jsx("input",{...d("password"),id:"password",type:"password",className:r(["mt-1","block","w-full","rounded-md","border","border-gray-300","px-3","py-2","shadow-sm","focus:border-purple-500","focus:outline-none","focus:ring-purple-500"]),placeholder:"••••••••••••",disabled:t}),n.password&&e.jsx("p",{className:r(["mt-1","text-sm","text-red-600"]),children:n.password.message})]}),e.jsx("button",{type:"submit",disabled:t,className:r(["w-full","rounded-md","bg-purple-600","px-4","py-2","text-white","hover:bg-purple-700","disabled:cursor-not-allowed","disabled:opacity-50"]),children:t?"ログイン中...":"ログイン"}),e.jsxs("div",{className:r(["text-center","text-sm","text-gray-600"]),children:["アカウントをお持ちでない方は",e.jsx(f,{href:c??"/register",className:r(["ml-1","text-purple-600","hover:underline"]),children:"こちら"})]})]})]})};m.__docgenInfo={description:`ログインフォームコンポーネント

@description
メール・パスワードを入力してログインするフォーム。
React Hook Form + zodによるバリデーション実装。

@example
\`\`\`tsx
<LoginForm
  onSubmit={async (data) => { await login(data); }}
  isLoading={false}
/>
\`\`\``,methods:[],displayName:"LoginForm",props:{onSubmit:{required:!0,tsType:{name:"signature",type:"function",raw:"(data: LoginInput) => Promise<void> | void",signature:{arguments:[{type:{name:"LoginInput"},name:"data"}],return:{name:"union",raw:"Promise<void> | void",elements:[{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"},{name:"void"}]}}},description:"ログイン処理のコールバック"},isLoading:{required:!1,tsType:{name:"boolean"},description:"ローディング状態",defaultValue:{value:"false",computed:!1}},errorMessage:{required:!1,tsType:{name:"string"},description:"サーバーエラーメッセージ"},registerHref:{required:!1,tsType:{name:"string"},description:"register へのリンクを上書きする（例: `/register?redirectUrl=...`）"}}};const j={title:"Features/Auth/LoginForm",component:m,parameters:{layout:"centered",docs:{description:{component:`ログインフォームコンポーネント

メール・パスワードを入力してログインするフォーム。
React Hook Form + zodによるバリデーション実装。`}}},tags:["autodocs"],args:{onSubmit:()=>{}}},s={args:{isLoading:!1},tags:["vrt"]},a={args:{isLoading:!0},tags:["vrt"]},o={args:{isLoading:!1,errorMessage:"メールアドレスまたはパスワードが正しくありません"},tags:["vrt"]};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    isLoading: false
  },
  tags: ["vrt"]
}`,...s.parameters?.docs?.source},description:{story:`デフォルト状態

通常のログインフォーム表示。`,...s.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    isLoading: true
  },
  tags: ["vrt"]
}`,...a.parameters?.docs?.source},description:{story:`ローディング状態

ログイン処理中の状態。ボタンが無効化され、テキストが変更されます。`,...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    isLoading: false,
    errorMessage: "メールアドレスまたはパスワードが正しくありません"
  },
  tags: ["vrt"]
}`,...o.parameters?.docs?.source},description:{story:`エラー状態

サーバーエラーが発生した際の表示。`,...o.parameters?.docs?.description}}};const L=["Default","Loading","WithError"];export{s as Default,a as Loading,o as WithError,L as __namedExportsOrder,j as default};
