import{j as e,r as l}from"./iframe-DxdPCBdZ.js";import{u as a,f as u}from"./focus-trap-react-B2HDzIZV.js";import{c as s}from"./clsx-B-dksMZM.js";import"./preload-helper-PPVm8Dsz.js";import"./react-Dl8H4SJg.js";function c(){const{isOpen:r,message:m,confirm:p,cancel:i}=a();return r?e.jsx(u.FocusTrap,{active:r,focusTrapOptions:{escapeDeactivates:!1},children:e.jsxs("div",{className:s(["fixed","inset-0","z-60","flex","items-center","justify-center","p-4"]),role:"dialog","aria-modal":"true","aria-labelledby":"confirm-dialog-title",children:[e.jsx("div",{"data-testid":"confirm-dialog-backdrop",className:s(["fixed","inset-0","bg-black/50"]),onClick:i,"aria-hidden":"true"}),e.jsxs("div",{className:s(["relative","w-full","max-w-sm","bg-white","rounded-xl","shadow-xl","p-6","flex","flex-col","gap-4"]),children:[e.jsx("p",{id:"confirm-dialog-title",className:s(["text-sm","text-gray-700","whitespace-pre-wrap"]),children:m}),e.jsxs("div",{className:s(["flex","justify-end","gap-3"]),children:[e.jsx("button",{type:"button",onClick:i,className:s(["px-4","py-2","text-sm","font-medium","text-gray-700","bg-gray-100","rounded-lg","hover:bg-gray-200","transition-colors"]),children:"キャンセル"}),e.jsx("button",{type:"button",onClick:p,className:s(["px-4","py-2","text-sm","font-medium","text-white","bg-blue-600","rounded-lg","hover:bg-blue-700","transition-colors"]),children:"OK"})]})]})]})}):null}c.__docgenInfo={description:"グローバル確認ダイアログ\n\n`useConfirm()` フックと組み合わせて使用する。\n`app/layout.tsx` に一度だけ配置することで、アプリ全体で確認ダイアログを利用できる。\n\n@example\n```tsx\n// app/layout.tsx\n<ConfirmDialog />\n```",methods:[],displayName:"ConfirmDialog"};const S={title:"Components/ConfirmDialog",component:c,parameters:{layout:"fullscreen"},tags:["autodocs"]},t={decorators:[r=>(l.useEffect(()=>(a.setState({isOpen:!0,message:"入力中の内容が破棄されます。閉じてもよいですか？",resolve:null}),()=>{a.setState({isOpen:!1,message:"",resolve:null})}),[]),e.jsx(r,{}))]},n={},o={decorators:[r=>(l.useEffect(()=>(a.setState({isOpen:!0,message:`この操作は取り消すことができません。
本当に削除してもよいですか？
削除されたデータは復元できません。`,resolve:null}),()=>{a.setState({isOpen:!1,message:"",resolve:null})}),[]),e.jsx(r,{}))]};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  decorators: [Story => {
    useEffect(() => {
      useConfirmStore.setState({
        isOpen: true,
        message: "入力中の内容が破棄されます。閉じてもよいですか？",
        resolve: null
      });
      return () => {
        useConfirmStore.setState({
          isOpen: false,
          message: "",
          resolve: null
        });
      };
    }, []);
    return <Story />;
  }]
}`,...t.parameters?.docs?.source},description:{story:"ダイアログが開いた状態",...t.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:"{}",...n.parameters?.docs?.source},description:{story:"ダイアログが閉じた状態（何も表示されない）",...n.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  decorators: [Story => {
    useEffect(() => {
      useConfirmStore.setState({
        isOpen: true,
        message: "この操作は取り消すことができません。\\n本当に削除してもよいですか？\\n削除されたデータは復元できません。",
        resolve: null
      });
      return () => {
        useConfirmStore.setState({
          isOpen: false,
          message: "",
          resolve: null
        });
      };
    }, []);
    return <Story />;
  }]
}`,...o.parameters?.docs?.source},description:{story:"長いメッセージ",...o.parameters?.docs?.description}}};const v=["Open","Closed","LongMessage"];export{n as Closed,o as LongMessage,t as Open,v as __namedExportsOrder,S as default};
