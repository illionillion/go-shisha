import{j as e}from"./iframe-BnilshMK.js";import{c as r}from"./clsx-B-dksMZM.js";import{F as T}from"./FlavorFilter-B21Reooi.js";import{P as I}from"./PostCard-Ca3Ep2IA.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BNi5uvoB.js";import"./PostOwnerMenu-BmcTK5YF.js";import"./Avatar-BKaESGn-.js";import"./link-Mhcy3qKR.js";import"./FlavorLabel-CFSAtfcI.js";function g({posts:l,isLoading:d=!1,error:f=null,errorMessage:y,availableFlavors:m=[],selectedFlavorIds:x=[],onFlavorToggle:p,onLike:u,onUnlike:h,currentUserId:F,onDelete:b,onEdit:C}){const _=s=>{if(u)return u(s);console.log("Liked post:",s)};return d?e.jsx("div",{className:r(["flex","items-center","justify-center","min-h-screen"]),children:e.jsx("div",{className:r(["text-gray-600"]),children:"読み込み中..."})}):f?e.jsx("div",{className:r(["flex","items-center","justify-center","min-h-screen"]),children:e.jsx("div",{className:r(["text-red-600"]),children:y??"エラーが発生しました"})}):l.length===0?e.jsx("p",{className:r(["text-center","text-gray-500"]),children:"投稿がありません"}):e.jsxs("div",{className:r(["mx-auto","max-w-4xl","px-4","py-6"]),children:[m.length>0&&p&&e.jsx(T,{flavors:m,selectedFlavorIds:x,onFlavorToggle:p}),e.jsx("div",{className:r(["grid","grid-cols-2","gap-4","md:grid-cols-3"]),children:l.map(s=>e.jsx(I,{post:s,href:`/posts/${s.id}`,onLike:_,onUnlike:h,currentUserId:F,onDelete:b,onEdit:C},s.id))})]})}g.__docgenInfo={description:`Timelineコンポーネント
REQUIREMENTS.mdの仕様に基づいた投稿タイムライン
- 2列グリッドレイアウト
- フレーバーフィルター（オプション）
- ローディング・エラーハンドリング`,methods:[],displayName:"Timeline",props:{posts:{required:!0,tsType:{name:"Array",elements:[{name:"Post"}],raw:"Post[]"},description:""},isLoading:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},error:{required:!1,tsType:{name:"unknown"},description:"",defaultValue:{value:"null",computed:!1}},errorMessage:{required:!1,tsType:{name:"string"},description:"エラー時に表示するメッセージ。省略時は汎用メッセージを表示"},availableFlavors:{required:!1,tsType:{name:"Array",elements:[{name:"Flavor"}],raw:"Flavor[]"},description:"",defaultValue:{value:"[]",computed:!1}},selectedFlavorIds:{required:!1,tsType:{name:"Array",elements:[{name:"number"}],raw:"number[]"},description:"",defaultValue:{value:"[]",computed:!1}},onFlavorToggle:{required:!1,tsType:{name:"signature",type:"function",raw:"(flavorId: number) => void",signature:{arguments:[{type:{name:"number"},name:"flavorId"}],return:{name:"void"}}},description:""},onLike:{required:!1,tsType:{name:"signature",type:"function",raw:"(postId: number) => void",signature:{arguments:[{type:{name:"number"},name:"postId"}],return:{name:"void"}}},description:""},onUnlike:{required:!1,tsType:{name:"signature",type:"function",raw:"(postId: number) => void",signature:{arguments:[{type:{name:"number"},name:"postId"}],return:{name:"void"}}},description:""},currentUserId:{required:!1,tsType:{name:"union",raw:"number | null",elements:[{name:"number"},{name:"null"}]},description:"現在ログイン中のユーザーID（自分の投稿かどうかの判定に使用）"},onDelete:{required:!1,tsType:{name:"signature",type:"function",raw:"(postId: number) => void",signature:{arguments:[{type:{name:"number"},name:"postId"}],return:{name:"void"}}},description:"投稿削除コールバック"},onEdit:{required:!1,tsType:{name:"signature",type:"function",raw:"(postId: number) => void",signature:{arguments:[{type:{name:"number"},name:"postId"}],return:{name:"void"}}},description:"投稿編集コールバック"}}};const v=[{id:1,name:"ミント",color:"bg-green-500"},{id:2,name:"アップル",color:"bg-red-500"},{id:3,name:"ベリー",color:"bg-purple-500"},{id:4,name:"マンゴー",color:"bg-yellow-500"}],c=[{id:1,user_id:1,slides:[{image_url:"https://placehold.co/400x600/CCCCCC/666666?text=Mint",text:"今日のシーシャは最高でした！ミント系のフレーバーが爽やかで最高",flavor:{id:1,name:"ミント",color:"bg-green-500"}}],likes:12,user:{id:1,email:"test@example.com",display_name:"テストユーザー",description:"シーシャ大好き！",icon_url:"",external_url:""}},{id:2,user_id:2,slides:[{image_url:"https://placehold.co/400x600/CCCCCC/666666?text=Apple",text:"新しいお店を発見！雰囲気も良くて味も抜群でした",flavor:{id:2,name:"アップル",color:"bg-red-500"}}],likes:8,user:{id:2,email:"shisha@example.com",display_name:"シーシャマスター",description:"毎日シーシャ吸ってます",icon_url:"",external_url:"https://twitter.com/shishamaster"}},{id:3,user_id:1,slides:[{image_url:"https://placehold.co/400x600/CCCCCC/666666?text=Berry",text:"ベリーの酸味がたまらない。ミックスもいいかも。",flavor:{id:3,name:"ベリー",color:"bg-purple-500"}}],likes:22,user:{id:1,email:"test@example.com",display_name:"テストユーザー",description:"シーシャ大好き！",icon_url:"",external_url:""}},{id:4,user_id:2,slides:[{image_url:"https://placehold.co/400x600/CCCCCC/666666?text=Mango",text:"マンゴーのトロピカル感が最高！ 夏にぴったり。",flavor:{id:4,name:"マンゴー",color:"bg-yellow-500"}}],likes:15,user:{id:2,email:"shisha@example.com",display_name:"シーシャマスター",description:"毎日シーシャ吸ってます",icon_url:"",external_url:"https://twitter.com/shishamaster"}}],A={title:"Features/Posts/Timeline",component:g,parameters:{layout:"fullscreen"},tags:["autodocs"],argTypes:{posts:{description:"投稿一覧"},isLoading:{description:"ローディング状態"},error:{description:"エラー"},availableFlavors:{description:"利用可能なフレーバー一覧"},selectedFlavorIds:{description:"選択中のフレーバーID配列"},onFlavorToggle:{action:"flavor toggled",description:"フレーバー選択切り替えハンドラー"}}},a={tags:["vrt","vrt-sp"],args:{posts:c,isLoading:!1,error:null}},t={tags:["vrt"],args:{posts:[],isLoading:!0,error:null}},o={tags:["vrt"],args:{posts:[],isLoading:!1,error:"データの取得に失敗しました"}},n={tags:["vrt","vrt-sp"],args:{posts:c,isLoading:!1,error:null,availableFlavors:v,selectedFlavorIds:[],onFlavorToggle:()=>{}}},i={tags:["vrt","vrt-sp"],args:{posts:c.filter(l=>{const d=l.slides?.[0];return d?.flavor?.id===1||d?.flavor?.id===3}),isLoading:!1,error:null,availableFlavors:v,selectedFlavorIds:[1,3],onFlavorToggle:()=>{}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  tags: ["vrt", "vrt-sp"],
  args: {
    posts: mockPosts,
    isLoading: false,
    error: null
  }
}`,...a.parameters?.docs?.source},description:{story:"デフォルトのタイムライン表示",...a.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    posts: [],
    isLoading: true,
    error: null
  }
}`,...t.parameters?.docs?.source},description:{story:"ローディング状態",...t.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    posts: [],
    isLoading: false,
    error: "データの取得に失敗しました"
  }
}`,...o.parameters?.docs?.source},description:{story:"エラー状態",...o.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  tags: ["vrt", "vrt-sp"],
  args: {
    posts: mockPosts,
    isLoading: false,
    error: null,
    availableFlavors: mockFlavors,
    selectedFlavorIds: [],
    onFlavorToggle: () => {}
  }
}`,...n.parameters?.docs?.source},description:{story:`フレーバーフィルター付き（インタラクティブ）
フィルター選択に応じてタイムラインの投稿が絞り込まれる`,...n.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  tags: ["vrt", "vrt-sp"],
  args: {
    posts: mockPosts.filter(post => {
      const firstSlide = post.slides?.[0];
      return firstSlide?.flavor?.id === 1 || firstSlide?.flavor?.id === 3;
    }),
    isLoading: false,
    error: null,
    availableFlavors: mockFlavors,
    selectedFlavorIds: [1, 3],
    onFlavorToggle: () => {}
  }
}`,...i.parameters?.docs?.source},description:{story:`フレーバーフィルター付き（初期選択あり）
ミントとベリーが選択された状態`,...i.parameters?.docs?.description}}};const M=["Default","Loading","Error","WithFlavorFilterInteractive","WithFlavorFilterPreselected"];export{a as Default,o as Error,t as Loading,n as WithFlavorFilterInteractive,i as WithFlavorFilterPreselected,M as __namedExportsOrder,A as default};
