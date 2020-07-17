import {Directive, ElementRef, Input, OnInit} from '@angular/core';

import {environment} from '@env/environment';

@Directive({
  selector: '[imgSrc]'
})

export class ImgSrcDirective implements OnInit {
  protected readonly CLASSNAME = 'ImgSrcDirective';

  @Input() imgSrc: string;

  private _elem: HTMLImageElement;

  constructor(private elRef: ElementRef) {
    this._elem = elRef.nativeElement;
  }

  ngOnInit() {
    if (this.imgSrc && this.imgSrc.length) {
      if (this.imgSrc[0] === '/')
        this._elem.setAttribute('src', environment.imagesDirPath + this.imgSrc.substring(1, this.imgSrc.length));
      else
        this._elem.setAttribute('src', environment.imagesDirPath + this.imgSrc);
    }
  }
}
