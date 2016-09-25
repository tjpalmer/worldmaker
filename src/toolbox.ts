export class Toolbox {

  constructor(body: HTMLElement) {
    let toolbox = body.querySelector('.tools');
    for (let any of <any>toolbox.querySelectorAll('input')) {
      let input: HTMLInputElement = any;
      input.addEventListener('change', () => {
        for (let any of <any>toolbox.querySelectorAll('label')) {
          let other: HTMLInputElement = any;
          other.classList.remove('selected');
        }
        (<HTMLElement>input.closest('label')).classList.add('selected');
      });
    }
  }

}
