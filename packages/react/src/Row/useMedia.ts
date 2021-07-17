import React from 'react';
import { env } from '@xl-vision/utils';
import { voidFn } from '../utils/function';

const matchMedia = (query: string) => {
  if (env.isServer) {
    return {
      addListener: voidFn,
      matches: false,
      removeListener: voidFn,
    };
  }
  return window.matchMedia(query);
};

const useMedia = (breakPoints: { [key: string]: number }, unit: string) => {
  const [media, setMedia] = React.useState<{ [key: string]: boolean }>({});

  const breakPointArray = React.useMemo(() => {
    return Object.keys(breakPoints).sort((a, b) => breakPoints[b] - breakPoints[a]);
  }, [breakPoints]);

  React.useEffect(() => {
    const handlerMap: {
      [breakPoint: string]: {
        listener: EventListener;
        mediaQuery: ReturnType<typeof matchMedia>;
      };
    } = {};
    const keys = Object.keys(breakPoints);
    keys.forEach((key) => {
      const size = breakPoints[key];
      const query = `(min-width: ${size}${unit})`;
      const mql = matchMedia(query);
      const onChange = () => {
        setMedia((prev) => ({
          ...prev,
          [key]: mql.matches,
        }));
      };
      handlerMap[key] = {
        listener: onChange,
        mediaQuery: mql,
      };
      mql.addListener(onChange);
      onChange();
    });
    return () => {
      keys.forEach((key) => {
        const { mediaQuery, listener } = handlerMap[key];
        mediaQuery.removeListener(listener);
      });
    };
  }, [breakPoints, unit]);

  return React.useMemo(() => breakPointArray.filter((it) => media[it]), [breakPointArray, media]);
};

export default useMedia;
