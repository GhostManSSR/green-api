import "@/assets/generalStyle.less";
import type { AppProps } from "next/app";
import {Layout} from "@/components/layout";
import {store} from "@/store";
import {Provider} from "react-redux";
import ReduxProvider from "@/ReduxProvider";

export default function App({ Component, pageProps }: AppProps) {
  return(
      <ReduxProvider>
        <Provider store={store}>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </Provider>
      </ReduxProvider>
  )
}
