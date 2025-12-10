import { WebContainer } from '@webcontainer/api';
import { WORK_DIR_NAME } from '~/utils/constants';

interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = (import.meta as any).hot?.data.webcontainerContext ?? {
  loaded: false,
};

if ((import.meta as any).hot) {
  (import.meta as any).hot.data.webcontainerContext = webcontainerContext;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for ssr
});

if (!(import.meta as any).env.SSR) {
  webcontainer =
    (import.meta as any).hot?.data.webcontainer ??
    Promise.resolve()
      .then(() => {
        return WebContainer.boot({ workdirName: WORK_DIR_NAME });
      })
      .then((webcontainer) => {
        webcontainerContext.loaded = true;
        return webcontainer;
      });

  if ((import.meta as any).hot) {
    (import.meta as any).hot.data.webcontainer = webcontainer;
  }
}