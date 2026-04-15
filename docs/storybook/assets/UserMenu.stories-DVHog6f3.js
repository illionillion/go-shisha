import{j as o,r as u,t as i}from"./iframe-DPD6zQMs.js";import{u as a,Q as d,a as m}from"./api-client-D8zIvC3b.js";import{U as p}from"./UserMenu-CbHEatPk.js";import"./preload-helper-PPVm8Dsz.js";import"./react-B86lCuWz.js";import"./clsx-B-dksMZM.js";import"./link-BsWwqRxE.js";import"./Avatar-jpavH0-L.js";const c={id:1,display_name:"テストユーザー",email:"test@example.com",icon_url:"",description:"これはテストユーザーです"},E={title:"Features/Auth/UserMenu",component:p,parameters:{layout:"centered",docs:{description:{component:`ユーザーメニューコンポーネントのStory

ログイン済み・未ログイン・ログアウト失敗時のトースト表示を確認できます。`}}},tags:["autodocs"],decorators:[r=>{const n=new d({defaultOptions:{queries:{retry:!1},mutations:{retry:!1}}});return o.jsx(m,{client:n,children:o.jsx(r,{})})}]},e={tags:["vrt"],decorators:[r=>(a.setState({user:c,isLoading:!1}),o.jsx(r,{}))]},t={tags:["vrt"],decorators:[r=>(a.setState({user:null,isLoading:!1}),o.jsx(r,{}))]},s={decorators:[r=>(u.useEffect(()=>{const n=i.error("ログアウトに失敗しました。時間をおいて再度お試しください。");return()=>{i.dismiss(n)}},[]),a.setState({user:c,isLoading:!1}),o.jsx(r,{}))]};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  decorators: [Story => {
    useAuthStore.setState({
      user: mockUser,
      isLoading: false
    });
    return <Story />;
  }]
}`,...e.parameters?.docs?.source},description:{story:`ログイン済み状態

アバターが表示され、クリックでドロップダウンが開きます。`,...e.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  tags: ["vrt"],
  decorators: [Story => {
    useAuthStore.setState({
      user: null,
      isLoading: false
    });
    return <Story />;
  }]
}`,...t.parameters?.docs?.source},description:{story:`未ログイン状態

ログインボタンが表示されます。`,...t.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  decorators: [Story => {
    useEffect(() => {
      const id = toast.error("ログアウトに失敗しました。時間をおいて再度お試しください。");
      return () => {
        toast.dismiss(id);
      };
    }, []);
    useAuthStore.setState({
      user: mockUser,
      isLoading: false
    });
    return <Story />;
  }]
}`,...s.parameters?.docs?.source},description:{story:`ログアウト失敗時のトースト通知確認

ログアウトAPIエラー発生時に toast.error() でエラートーストが表示されることを確認する。
Storybook上では toast.error() を直接呼び出してトーストの見た目を確認します。`,...s.parameters?.docs?.description}}};const h=["LoggedIn","LoggedOut","LogoutErrorToast"];export{e as LoggedIn,t as LoggedOut,s as LogoutErrorToast,h as __namedExportsOrder,E as default};
