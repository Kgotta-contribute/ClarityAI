
declare module 'design-language';

declare module 'react-router-dom';

declare module 'design-language/utilities/Download';

declare module 'design-language/utilities/ThemeColor';

declare module 'design-language/colors';

 

// CSS module declarations

declare module '*.css' {

  const content: { [className: string]: string };

  export default content;

}