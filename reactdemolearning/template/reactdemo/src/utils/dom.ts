/**
 * 防抖函数
 * @param fn 需要防抖的函数
 * @param delay 防抖的延迟时间(ms)
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout> | null = null;
  
    return (...args: Parameters<T>): void => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  }
// 以1920px 底图为准开发页面
export const setDomFontSize = (): void => {
  let width = document.documentElement.clientWidth || document.body.clientWidth;
  let fontsize = (width <= 1200 ? 1200 : width) / 100 + 'px';
  (document.getElementsByTagName('html')[0].style as any)['font-size'] = fontsize;
}

let setDomFontSizeDebounce = debounce(setDomFontSize, 400)
window.addEventListener('resize', setDomFontSizeDebounce); 

export   const  testValue = () => {
   console.log("xxxxx")
}