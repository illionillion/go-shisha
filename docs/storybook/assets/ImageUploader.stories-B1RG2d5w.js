import{j as s}from"./iframe-D1P1EEeX.js";import{I as w}from"./ImageUploader-Ce2aT3I1.js";import"./preload-helper-PPVm8Dsz.js";import"./clsx-B-dksMZM.js";import"./index-6jokaDUC.js";const t=(e,S,u)=>{const m=document.createElement("canvas");m.width=200,m.height=150;const a=m.getContext("2d");a&&(a.fillStyle=S,a.fillRect(0,0,200,150),a.fillStyle="#FFFFFF",a.font="bold 16px Arial",a.textAlign="center",a.textBaseline="middle",a.fillText(e,100,75));const x=m.toDataURL("image/png").split(","),h=x[0].match(/:(.*?);/)?.[1]||"image/png",f=atob(x[1]);let g=f.length;const p=new Uint8Array(g);for(;g--;)p[g]=f.charCodeAt(g);const j=u*1024,v=p.length,b=Math.max(0,j-v),F=new Uint8Array(p.length+b);return F.set(p),new File([new Blob([F])],e,{type:h})},I={title:"Features/Posts/ImageUploader",component:w,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{onFilesSelected:{action:"files selected"}}},l={args:{onFilesSelected:e=>{console.log("Selected files:",e)}},tags:["vrt"],decorators:[e=>s.jsxs("div",{className:"w-full max-w-2xl p-8",children:[s.jsx("h2",{className:"mb-4 text-xl font-bold",children:"画像アップロード"}),s.jsx(e,{})]})]},r={args:{onFilesSelected:e=>{console.log("Selected files:",e)},maxFiles:3},tags:["vrt"],decorators:[e=>s.jsxs("div",{className:"w-full max-w-2xl p-8",children:[s.jsx("h2",{className:"mb-4 text-xl font-bold",children:"最大3枚まで"}),s.jsx(e,{})]})]},o={args:{onFilesSelected:e=>{console.log("Selected files:",e)},maxSizeMB:5},tags:["vrt"],decorators:[e=>s.jsxs("div",{className:"w-full max-w-2xl p-8",children:[s.jsx("h2",{className:"mb-4 text-xl font-bold",children:"5MB以下のファイル"}),s.jsx(e,{})]})]},n={args:{onFilesSelected:e=>{console.log("Selected files:",e)},disabled:!0},tags:["vrt"],decorators:[e=>s.jsxs("div",{className:"w-full max-w-2xl p-8",children:[s.jsx("h2",{className:"mb-4 text-xl font-bold",children:"無効状態"}),s.jsx(e,{})]})]},i={args:{onFilesSelected:e=>{console.log("Selected files:",e)},acceptedFormats:["image/jpeg","image/jpg","image/png"]},tags:["vrt"],decorators:[e=>s.jsxs("div",{className:"w-full max-w-2xl p-8",children:[s.jsx("h2",{className:"mb-4 text-xl font-bold",children:"PNG/JPGのみ受付"}),s.jsx(e,{})]})]},c={args:{onFilesSelected:e=>{console.log("Selected files:",e)},value:[t("beach-sunset.jpg","#FF6B6B",2048),t("mountain-view.png","#4ECDC4",1536),t("city-night.webp","#45B7D1",3072)]},tags:["vrt"],decorators:[e=>s.jsxs("div",{className:"w-full max-w-2xl p-8",children:[s.jsx("h2",{className:"mb-4 text-xl font-bold",children:"画像選択済み（プレビュー表示）"}),s.jsx(e,{})]})]},d={args:{onFilesSelected:e=>{console.log("Selected files:",e)},value:[t("image-1.jpg","#FF6B6B",512),t("image-2.jpg","#4ECDC4",1024),t("image-3.jpg","#45B7D1",1536),t("image-4.jpg","#96CEB4",2048),t("image-5.jpg","#FFEAA7",2560),t("image-6.jpg","#DFE6E9",3072),t("image-7.jpg","#74B9FF",3584),t("image-8.jpg","#A29BFE",4096),t("image-9.jpg","#FD79A8",4608)]},tags:["vrt"],decorators:[e=>s.jsxs("div",{className:"w-full max-w-2xl p-8",children:[s.jsx("h2",{className:"mb-4 text-xl font-bold",children:"上限間近（9/10枚）"}),s.jsx(e,{})]})]};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    onFilesSelected: files => {
      console.log("Selected files:", files);
    }
  },
  tags: ["vrt"],
  decorators: [Story => <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">画像アップロード</h2>
        <Story />
      </div>]
}`,...l.parameters?.docs?.source},description:{story:`デフォルト表示

画像をドラッグ&ドロップまたはクリックで選択`,...l.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    onFilesSelected: files => {
      console.log("Selected files:", files);
    },
    maxFiles: 3
  },
  tags: ["vrt"],
  decorators: [Story => <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">最大3枚まで</h2>
        <Story />
      </div>]
}`,...r.parameters?.docs?.source},description:{story:`ファイル数制限

最大3枚まで選択可能`,...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    onFilesSelected: files => {
      console.log("Selected files:", files);
    },
    maxSizeMB: 5
  },
  tags: ["vrt"],
  decorators: [Story => <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">5MB以下のファイル</h2>
        <Story />
      </div>]
}`,...o.parameters?.docs?.source},description:{story:`ファイルサイズ制限

各ファイル5MB以下`,...o.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    onFilesSelected: files => {
      console.log("Selected files:", files);
    },
    disabled: true
  },
  tags: ["vrt"],
  decorators: [Story => <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">無効状態</h2>
        <Story />
      </div>]
}`,...n.parameters?.docs?.source},description:{story:`無効状態

アップロード不可の状態`,...n.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    onFilesSelected: files => {
      console.log("Selected files:", files);
    },
    acceptedFormats: ["image/jpeg", "image/jpg", "image/png"]
  },
  tags: ["vrt"],
  decorators: [Story => <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">PNG/JPGのみ受付</h2>
        <Story />
      </div>]
}`,...i.parameters?.docs?.source},description:{story:`PNG/JPGのみ

受け入れ形式を制限`,...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    onFilesSelected: files => {
      console.log("Selected files:", files);
    },
    value: [createImageFile("beach-sunset.jpg", "#FF6B6B", 2048), createImageFile("mountain-view.png", "#4ECDC4", 1536), createImageFile("city-night.webp", "#45B7D1", 3072)]
  },
  tags: ["vrt"],
  decorators: [Story => <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">画像選択済み（プレビュー表示）</h2>
        <Story />
      </div>]
}`,...c.parameters?.docs?.source},description:{story:`プレビュー表示（画像選択済み）

Storybook上で初期状態から画像が選択されている状態をシミュレート`,...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    onFilesSelected: files => {
      console.log("Selected files:", files);
    },
    value: [createImageFile("image-1.jpg", "#FF6B6B", 512), createImageFile("image-2.jpg", "#4ECDC4", 1024), createImageFile("image-3.jpg", "#45B7D1", 1536), createImageFile("image-4.jpg", "#96CEB4", 2048), createImageFile("image-5.jpg", "#FFEAA7", 2560), createImageFile("image-6.jpg", "#DFE6E9", 3072), createImageFile("image-7.jpg", "#74B9FF", 3584), createImageFile("image-8.jpg", "#A29BFE", 4096), createImageFile("image-9.jpg", "#FD79A8", 4608)]
  },
  tags: ["vrt"],
  decorators: [Story => <div className="w-full max-w-2xl p-8">
        <h2 className="mb-4 text-xl font-bold">上限間近（9/10枚）</h2>
        <Story />
      </div>]
}`,...d.parameters?.docs?.source},description:{story:`プレビュー表示（上限間近）

最大10枚中9枚選択済み`,...d.parameters?.docs?.description}}};const C=["Default","LimitedFiles","SizeLimit","Disabled","LimitedFormats","WithPreview","AlmostFull"];export{d as AlmostFull,l as Default,n as Disabled,r as LimitedFiles,i as LimitedFormats,o as SizeLimit,c as WithPreview,C as __namedExportsOrder,I as default};
