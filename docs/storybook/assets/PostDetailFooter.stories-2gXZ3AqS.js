import{r as n,t as o,j as c}from"./iframe-DPD6zQMs.js";import{P as d}from"./PostDetailFooter-BNNPleX9.js";import"./preload-helper-PPVm8Dsz.js";import"./clsx-B-dksMZM.js";import"./FlavorLabel-DD3HuWot.js";import"./index-CTJmR-os.js";const r={id:1,name:"ダブルアップル",color:"bg-red-500"},f={title:"Features/Posts/PostDetailFooter",component:d,parameters:{layout:"centered",docs:{description:{component:`投稿詳細フッターコンポーネントのStory

いいね・シェアボタンの表示と操作、URLコピー成功時のトースト通知を確認できます。`}}},tags:["autodocs"],args:{optimisticLikes:5,isLiked:!1,onLike:()=>{}}},s={tags:["vrt"],args:{currentSlide:{text:"シーシャの感想を書きました。とても美味しかったです！",flavor:r},isLiked:!1,optimisticLikes:5}},t={tags:["vrt"],args:{currentSlide:{text:"シーシャの感想を書きました。とても美味しかったです！",flavor:r},isLiked:!0,optimisticLikes:6}},e={decorators:[a=>(n.useEffect(()=>{const i=o.success("URLをコピーしました");return()=>{o.dismiss(i)}},[]),c.jsx(a,{}))],args:{currentSlide:{text:"シーシャの感想を書きました。とても美味しかったです！",flavor:r},isLiked:!1,optimisticLikes:5}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    currentSlide: {
      text: "シーシャの感想を書きました。とても美味しかったです！",
      flavor: mockFlavor
    },
    isLiked: false,
    optimisticLikes: 5
  }
}`,...s.parameters?.docs?.source},description:{story:"デフォルト状態（未いいね）",...s.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    currentSlide: {
      text: "シーシャの感想を書きました。とても美味しかったです！",
      flavor: mockFlavor
    },
    isLiked: true,
    optimisticLikes: 6
  }
}`,...t.parameters?.docs?.source},description:{story:"いいね済み状態",...t.parameters?.docs?.description}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  decorators: [Story => {
    useEffect(() => {
      const id = toast.success("URLをコピーしました");
      return () => {
        toast.dismiss(id);
      };
    }, []);
    return <Story />;
  }],
  args: {
    currentSlide: {
      text: "シーシャの感想を書きました。とても美味しかったです！",
      flavor: mockFlavor
    },
    isLiked: false,
    optimisticLikes: 5
  }
}`,...e.parameters?.docs?.source},description:{story:`URLコピー成功時のトースト通知確認

シェアボタン押下後に toast.success() が表示されることを確認する。
Storybook上ではトーストを直接発火して見た目を確認します。`,...e.parameters?.docs?.description}}};const S=["Default","Liked","ShareSuccessToast"];export{s as Default,t as Liked,e as ShareSuccessToast,S as __namedExportsOrder,f as default};
