import{j as e}from"./iframe-D1P1EEeX.js";import{c as n}from"./clsx-B-dksMZM.js";import{F as m}from"./FlavorLabel-BNOkLGXT.js";const f=({flavors:t,selectedFlavorId:s,onSelect:o,error:a,disabled:l=!1,className:u})=>{const i=t.find(r=>r.id===s),c=r=>{const d=r.target.value;o(d===""?void 0:Number(d))};return e.jsxs("div",{className:n(["w-full",u]),children:[e.jsx("label",{htmlFor:"flavor-select",className:n(["block","text-sm","font-medium","text-gray-700","mb-1"]),children:"フレーバー（任意）"}),e.jsxs("div",{className:n(["flex","items-center","gap-2"]),children:[e.jsxs("select",{id:"flavor-select",value:s??"",onChange:c,disabled:l,"aria-invalid":!!a,"aria-describedby":a?"flavor-error":void 0,className:n(["block","w-full","px-3","py-2","border","rounded-md","shadow-sm","focus:outline-none","focus:ring-2","focus:ring-indigo-500","focus:border-indigo-500","disabled:bg-gray-100","disabled:cursor-not-allowed",a?"border-red-500":"border-gray-300"]),children:[e.jsx("option",{value:"",children:"フレーバーを選択してください"}),t.map(r=>e.jsx("option",{value:r.id,children:r.name},r.id))]}),s&&e.jsx("button",{type:"button",onClick:()=>o(void 0),disabled:l,"aria-label":"フレーバー選択を解除",className:n(["px-3","py-2","text-sm","font-medium","text-gray-700","bg-white","border","border-gray-300","rounded-md","hover:bg-gray-50","focus:outline-none","focus:ring-2","focus:ring-indigo-500","focus:ring-offset-2","disabled:opacity-50","disabled:cursor-not-allowed","whitespace-nowrap","shrink-0"]),children:"解除"})]}),i&&e.jsx("div",{className:n(["mt-2"]),children:e.jsx(m,{flavor:i})}),a&&e.jsx("p",{id:"flavor-error",className:n(["mt-1","text-sm","text-red-600"]),role:"alert",children:a})]})};f.__docgenInfo={description:`フレーバー選択コンポーネント

投稿作成時にフレーバーを選択するドロップダウンUI。
フレーバーはオプションのため、選択解除も可能。

@example
\`\`\`tsx
const [selectedFlavorId, setSelectedFlavorId] = useState<number | undefined>();
const query = useGetFlavors();
const flavors = getFlavorsData(query);

if (!flavors) return null;

return (
  <FlavorSelector
    flavors={flavors}
    selectedFlavorId={selectedFlavorId}
    onSelect={setSelectedFlavorId}
  />
);
\`\`\``,methods:[],displayName:"FlavorSelector",props:{flavors:{required:!0,tsType:{name:"Array",elements:[{name:"Flavor"}],raw:"Flavor[]"},description:"フレーバー一覧（GET /api/v1/flavors から取得したデータ）"},selectedFlavorId:{required:!1,tsType:{name:"number"},description:"選択されたフレーバーのID（未選択時はundefined）"},onSelect:{required:!0,tsType:{name:"signature",type:"function",raw:"(flavorId: number | undefined) => void",signature:{arguments:[{type:{name:"union",raw:"number | undefined",elements:[{name:"number"},{name:"undefined"}]},name:"flavorId"}],return:{name:"void"}}},description:`フレーバー選択時のコールバック
@param flavorId - 選択されたフレーバーのID（選択解除時はundefined）`},error:{required:!1,tsType:{name:"string"},description:"エラー状態（バリデーションエラー等）"},disabled:{required:!1,tsType:{name:"boolean"},description:"無効化状態（ローディング中等）",defaultValue:{value:"false",computed:!1}},className:{required:!1,tsType:{name:"union",raw:"string | string[]",elements:[{name:"string"},{name:"Array",elements:[{name:"string"}],raw:"string[]"}]},description:"カスタムクラス名"}}};export{f as F};
