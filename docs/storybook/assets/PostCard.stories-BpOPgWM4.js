import{j as l}from"./iframe-D1P1EEeX.js";import{P as d}from"./PostCard-Bj79riGr.js";import"./preload-helper-PPVm8Dsz.js";import"./PostOwnerMenu-CCWhoAdK.js";import"./clsx-B-dksMZM.js";import"./index-6jokaDUC.js";import"./Avatar-CYiyzyBJ.js";import"./link-BOJZIZpD.js";import"./FlavorLabel-BNOkLGXT.js";const c={id:1,user_id:1,slides:[{image_url:"https://placehold.co/400x600/CCCCCC/666666?text=Mint",text:"今日のシーシャは最高でした！ミント系のフレーバーが爽やかで最高",flavor:{id:1,name:"ミント",color:"bg-green-500"}}],likes:12,user:{id:1,email:"test@example.com",display_name:"テストユーザー",description:"シーシャ大好き！",icon_url:"",external_url:""}},F={id:2,user_id:2,slides:[{image_url:"https://placehold.co/400x600/CCCCCC/666666?text=Shisha",text:"新しいお店を発見！雰囲気も良くて味も抜群でした"}],likes:8,user:{id:2,email:"shisha@example.com",display_name:"シーシャマスター",description:"毎日シーシャ吸ってます",icon_url:"",external_url:"https://twitter.com/shishamaster"}},y={title:"Features/Posts/PostCard",component:d,parameters:{layout:"padded"},tags:["autodocs"],argTypes:{post:{description:"投稿データ"},onLike:{action:"liked"}},decorators:[p=>l.jsx("div",{style:{width:"400px"},children:l.jsx(p,{})})]},e={tags:["vrt"],args:{post:c,onLike:()=>{}}},t={tags:["vrt"],args:{post:F,onLike:()=>{}}},r={tags:["vrt"],args:{post:{...c,slides:[{image_url:"https://placehold.co/400x600/CCCCCC/666666?text=Mint",text:"この投稿は非常に長いメッセージを含んでいます。シーシャの味わいや雰囲気、お店の詳細など、たくさんの情報を共有したい時に使います。3行を超える部分は省略記号で表示されます。",flavor:{id:1,name:"ミント",color:"bg-green-500"}}]},onLike:()=>{}}},o={tags:["vrt"],args:{post:{...c,id:3,slides:[{image_url:"https://placehold.co/400x600/CCCCCC/666666?text=Berry",text:"ベリーの酸味がたまらない。ミックスもいいかも。",flavor:{id:3,name:"ベリー",color:"bg-purple-500"}}],likes:22},onLike:()=>{}}},n={tags:["vrt"],args:{post:{...c,id:4,slides:[{image_url:"",text:"画像なしの投稿です。フォールバック画像が表示されます。"}],likes:5},onLike:()=>{}}},s={args:{post:{id:5,user_id:1,slides:[{image_url:"https://placehold.co/400x600/4CAF50/FFFFFF?text=Slide+1+Mint",text:"1枚目：爽やかなミント系",flavor:{id:1,name:"ミント",color:"bg-green-500"}},{image_url:"https://placehold.co/400x600/9C27B0/FFFFFF?text=Slide+2+Berry",text:"2枚目：甘酸っぱいベリー系",flavor:{id:3,name:"ベリー",color:"bg-purple-500"}},{image_url:"https://placehold.co/400x600/FF9800/FFFFFF?text=Slide+3+Orange",text:"3枚目：フルーティーなオレンジ",flavor:{id:5,name:"オレンジ",color:"bg-orange-500"}}],likes:42,user:{id:1,email:"test@example.com",display_name:"テストユーザー",description:"シーシャ大好き！",icon_url:"",external_url:""}},onLike:()=>{}}},a={args:{post:{id:6,user_id:1,slides:[{image_url:"https://placehold.co/400x600/4CAF50/FFFFFF?text=1",text:"1枚目"},{image_url:"https://placehold.co/400x600/2196F3/FFFFFF?text=2",text:"2枚目"},{image_url:"https://placehold.co/400x600/9C27B0/FFFFFF?text=3",text:"3枚目"},{image_url:"https://placehold.co/400x600/FF9800/FFFFFF?text=4",text:"4枚目"},{image_url:"https://placehold.co/400x600/F44336/FFFFFF?text=5",text:"5枚目"}],likes:100,user:{id:1,email:"test@example.com",display_name:"テストユーザー",description:"シーシャ大好き！",icon_url:"",external_url:""}},onLike:()=>{}}},i={tags:["vrt"],args:{post:{id:7,user_id:1,slides:[{image_url:"https://placehold.co/400x600/4CAF50/FFFFFF?text=1",text:"1枚目：プログレスバー確認",flavor:{id:1,name:"ミント",color:"bg-green-500"}},{image_url:"https://placehold.co/400x600/2196F3/FFFFFF?text=2",text:"2枚目",flavor:{id:2,name:"ベリー",color:"bg-purple-500"}},{image_url:"https://placehold.co/400x600/9C27B0/FFFFFF?text=3",text:"3枚目",flavor:{id:3,name:"オレンジ",color:"bg-orange-500"}}],likes:15,user:c.user},autoPlayInterval:3e3,onLike:()=>{}},decorators:[p=>l.jsxs("div",{style:{width:"400px"},children:[l.jsx("style",{children:`
            /* VRT用: CSS Animationを完全停止 */
            * {
              animation-play-state: paused !important;
              animation-duration: 0s !important;
            }
          `}),l.jsx(p,{})]})],parameters:{chromatic:{delay:100}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    post: mockPost,
    onLike: () => {}
  }
}`,...e.parameters?.docs?.source},description:{story:"フレーバー付き投稿カード",...e.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    post: mockPostWithoutFlavor,
    onLike: () => {}
  }
}`,...t.parameters?.docs?.source},description:{story:"フレーバーなし投稿カード",...t.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    post: {
      ...mockPost,
      slides: [{
        image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Mint",
        text: "この投稿は非常に長いメッセージを含んでいます。シーシャの味わいや雰囲気、お店の詳細など、たくさんの情報を共有したい時に使います。3行を超える部分は省略記号で表示されます。",
        flavor: {
          id: 1,
          name: "ミント",
          color: "bg-green-500"
        }
      }]
    },
    onLike: () => {}
  }
}`,...r.parameters?.docs?.source},description:{story:"長いメッセージの投稿カード（line-clamp-3で3行まで表示）",...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    post: {
      ...mockPost,
      id: 3,
      slides: [{
        image_url: "https://placehold.co/400x600/CCCCCC/666666?text=Berry",
        text: "ベリーの酸味がたまらない。ミックスもいいかも。",
        flavor: {
          id: 3,
          name: "ベリー",
          color: "bg-purple-500"
        }
      }],
      likes: 22
    },
    onLike: () => {}
  }
}`,...o.parameters?.docs?.source},description:{story:"異なるフレーバー（ベリー）",...o.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    post: {
      ...mockPost,
      id: 4,
      slides: [{
        image_url: "",
        text: "画像なしの投稿です。フォールバック画像が表示されます。"
      }],
      likes: 5
    },
    onLike: () => {}
  }
}`,...n.parameters?.docs?.source},description:{story:"画像なし投稿カード（フォールバック画像表示）",...n.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    post: {
      id: 5,
      user_id: 1,
      slides: [{
        image_url: "https://placehold.co/400x600/4CAF50/FFFFFF?text=Slide+1+Mint",
        text: "1枚目：爽やかなミント系",
        flavor: {
          id: 1,
          name: "ミント",
          color: "bg-green-500"
        }
      }, {
        image_url: "https://placehold.co/400x600/9C27B0/FFFFFF?text=Slide+2+Berry",
        text: "2枚目：甘酸っぱいベリー系",
        flavor: {
          id: 3,
          name: "ベリー",
          color: "bg-purple-500"
        }
      }, {
        image_url: "https://placehold.co/400x600/FF9800/FFFFFF?text=Slide+3+Orange",
        text: "3枚目：フルーティーなオレンジ",
        flavor: {
          id: 5,
          name: "オレンジ",
          color: "bg-orange-500"
        }
      }],
      likes: 42,
      user: {
        id: 1,
        email: "test@example.com",
        display_name: "テストユーザー",
        description: "シーシャ大好き！",
        icon_url: "",
        external_url: ""
      }
    },
    onLike: () => {}
  }
}`,...s.parameters?.docs?.source},description:{story:`複数画像スライド（3枚）
⚠️ VRT対象外: CSS Animationによるプログレスバーが含まれるため不安定`,...s.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    post: {
      id: 6,
      user_id: 1,
      slides: [{
        image_url: "https://placehold.co/400x600/4CAF50/FFFFFF?text=1",
        text: "1枚目"
      }, {
        image_url: "https://placehold.co/400x600/2196F3/FFFFFF?text=2",
        text: "2枚目"
      }, {
        image_url: "https://placehold.co/400x600/9C27B0/FFFFFF?text=3",
        text: "3枚目"
      }, {
        image_url: "https://placehold.co/400x600/FF9800/FFFFFF?text=4",
        text: "4枚目"
      }, {
        image_url: "https://placehold.co/400x600/F44336/FFFFFF?text=5",
        text: "5枚目"
      }],
      likes: 100,
      user: {
        id: 1,
        email: "test@example.com",
        display_name: "テストユーザー",
        description: "シーシャ大好き！",
        icon_url: "",
        external_url: ""
      }
    },
    onLike: () => {}
  }
}`,...a.parameters?.docs?.source},description:{story:`複数画像スライド（5枚）
⚠️ VRT対象外: CSS Animationによるプログレスバーが含まれるため不安定`,...a.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  args: {
    post: {
      id: 7,
      user_id: 1,
      slides: [{
        image_url: "https://placehold.co/400x600/4CAF50/FFFFFF?text=1",
        text: "1枚目：プログレスバー確認",
        flavor: {
          id: 1,
          name: "ミント",
          color: "bg-green-500"
        }
      }, {
        image_url: "https://placehold.co/400x600/2196F3/FFFFFF?text=2",
        text: "2枚目",
        flavor: {
          id: 2,
          name: "ベリー",
          color: "bg-purple-500"
        }
      }, {
        image_url: "https://placehold.co/400x600/9C27B0/FFFFFF?text=3",
        text: "3枚目",
        flavor: {
          id: 3,
          name: "オレンジ",
          color: "bg-orange-500"
        }
      }],
      likes: 15,
      user: mockPost.user!
    },
    autoPlayInterval: 3000,
    onLike: () => {}
  },
  decorators: [Story => <div style={{
    width: "400px"
  }}>
        <style>
          {\`
            /* VRT用: CSS Animationを完全停止 */
            * {
              animation-play-state: paused !important;
              animation-duration: 0s !important;
            }
          \`}
        </style>
        <Story />
      </div>],
  parameters: {
    // アニメーションは停止しているので、レンダリング完了のみ待つ
    chromatic: {
      delay: 100
    }
  }
}`,...i.parameters?.docs?.source},description:{story:`プログレスバー静止状態（VRT用）
複数スライドの初期状態（1枚目表示、プログレスバー表示）
CSS Animationを完全に無効化してプログレスバーのレイアウトをVRTでテスト`,...i.parameters?.docs?.description}}};const S=["WithFlavor","WithoutFlavor","LongMessage","BerryFlavor","WithoutImage","MultipleSlides","FiveSlides","ProgressBarStatic"];export{o as BerryFlavor,a as FiveSlides,r as LongMessage,s as MultipleSlides,i as ProgressBarStatic,e as WithFlavor,t as WithoutFlavor,n as WithoutImage,S as __namedExportsOrder,y as default};
