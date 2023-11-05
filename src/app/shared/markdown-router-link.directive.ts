import { Directive, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[appMarkdownRouterLink]',
  standalone: true
})
export class MarkdownRouterLinkDirective {

  @HostListener('click', ['$event'])
  handleClick(event: MouseEvent): void {

    const targetEl = event.target as HTMLElement;

    if (targetEl instanceof HTMLAnchorElement && targetEl.nodeName === 'A') {

      const href = targetEl.getAttribute('href');

      if (href && href.startsWith('/')) {
        event.preventDefault();
        this.router.navigateByUrl(href);
      }
    }
  }

  constructor(private router: Router) { }

}
