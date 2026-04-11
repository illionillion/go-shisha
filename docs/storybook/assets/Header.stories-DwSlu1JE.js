import{u as d,j as e}from"./iframe-D1P1EEeX.js";import{u as n,Q as l,a as m}from"./api-client-BF9ID2B7.js";import{c as t}from"./clsx-B-dksMZM.js";import{L as u}from"./link-BOJZIZpD.js";import{U as p}from"./UserMenu-CtoljGA0.js";import"./preload-helper-PPVm8Dsz.js";import"./react-kYXiBY6p.js";import"./Avatar-CYiyzyBJ.js";function i(){const r=d();return r&&["/login","/register"].some(c=>r.startsWith(c))?null:e.jsxs("header",{className:t(["sticky","top-0","z-50","flex","items-center","justify-between","p-4","bg-white","border-b","border-gray-200"]),children:[e.jsxs(u,{href:"/",className:t(["flex","items-center","space-x-2"]),children:[e.jsx("div",{className:t(["w-8","h-8","bg-gradient-to-br","from-green-400","to-blue-500","rounded-full","flex","items-center","justify-center"]),children:e.jsx("span",{className:t(["text-white","font-bold","text-sm"]),children:"S"})}),e.jsx("h1",{className:t(["text-xl","font-bold","text-gray-900"]),children:"シーシャ行こう"})]}),e.jsx(p,{})]})}i.__docgenInfo={description:`Headerコンポーネント
アプリケーションのヘッダーを表示
- 左側: サイトロゴとタイトル
- 右側: ユーザーメニュー（ログイン状態に応じて表示変更）`,methods:[],displayName:"Header"};const f={id:1,display_name:"テストユーザー",email:"test@example.com",icon_url:"",description:"これはテストユーザーです"},N={title:"Components/Header",component:i,parameters:{layout:"fullscreen"},tags:["autodocs","vrt","vrt-sp"],decorators:[r=>{const a=new l({defaultOptions:{queries:{retry:!1},mutations:{retry:!1}}});return e.jsx(m,{client:a,children:e.jsx(r,{})})}]},s={decorators:[r=>(n.setState({user:f,isLoading:!1}),e.jsx(r,{}))]},o={decorators:[r=>(n.setState({user:null,isLoading:!1}),e.jsx(r,{}))]};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  decorators: [Story => {
    useAuthStore.setState({
      user: mockUser,
      isLoading: false
    });
    return <Story />;
  }]
}`,...s.parameters?.docs?.source},description:{story:"ログイン済み状態のヘッダー",...s.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  decorators: [Story => {
    useAuthStore.setState({
      user: null,
      isLoading: false
    });
    return <Story />;
  }]
}`,...o.parameters?.docs?.source},description:{story:"未ログイン状態のヘッダー",...o.parameters?.docs?.description}}};const _=["LoggedIn","LoggedOut"];export{s as LoggedIn,o as LoggedOut,_ as __namedExportsOrder,N as default};
