import { VaultService } from '@services/vault.svc';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { LoggingService, ProductService } from '@app/services';
import { ProductContext, RTPDashboardStats } from '@entities/models';
import { PRODUCT_NAME } from '@entities/enums';
import { CONSTANTS } from '@entities/constants';
import { PRODUCT_IDS } from '@app/entities/product-ids';
import { IApiResponseBackend } from '@app/entities/api-response';

@Component({
  selector: 'dash-product',
  templateUrl: './dash-product.html',
  styleUrls: ['./dash-product.scss']
})

export class DashboardProductComponent implements OnInit {
  protected readonly CLASSNAME = 'DashboardProductComponent';

  private readonly TOOLTIP_CSS_CLASS = 'tooltip_180_bottom';
  public prdList: number[] = [];

  @Input() collapsed = false;
  @Input() selected = false;
  rtp: number;
  qr: number;

  @Input() set product(product: ProductContext) {
    try {
      if (product.productId !== PRODUCT_IDS.INTRO) {

        let imgUrl = product.prefix ? product.prefix : null;
        if (product.productId  == PRODUCT_IDS.CRDMNT || product.productId  == PRODUCT_IDS.QR || product.productId  == PRODUCT_IDS.CPSRTP) {
            imgUrl = product.prefix ? product.prefix : (product.productName  ? product.productName.replace(/\s/g, '') : null);
        }
        // Temporary code that need to be cleaned up in laer revisions
        if(product.productName==='Extra Awards')
        {
          imgUrl = product.productName.replace(/\s/g, '');
        }
        this.productImageUrl = imgUrl ? `/images/${imgUrl}_Small.png` : `/images/coming-soon-sticker.jpg`;
      }
      this.productContext = product;
    }
    catch (err) {
      this.productContext = null;
    }
  }

  @Output() onProductCardClick = new EventEmitter<number>();

  public get productCssClass() {
    let classes = this.productContext.mainCssClass;

    if (classes == null) {
        classes = this.productContext.productName.replace(/\s/g, "").toLowerCase( );
        this.productContext.mainCssClass = classes;
    }

    if (this.selected)
      classes += ' selected';

    return classes;
  }

  public get onBGImageCssClass() {
    let classes = this.productContext.bigImageCssClass;

    if (classes == null) {
        classes = this.productContext.productName.replace(/\s/g, "").toLowerCase( );
        classes = classes+'-bg';
    }
    return classes;
  }

  public PRODUCT_NAME = PRODUCT_NAME;
  public productsRouteBase = CONSTANTS.app.productsRouteBase;
  public productContext: ProductContext;
  public productImageUrl = '';
  public rtpStats: RTPDashboardStats;

  constructor(private _log: LoggingService,
    private _vaultService: VaultService,
    private _prdSvc: ProductService) {
      this.rtp = PRODUCT_IDS.CPSRTP;
      this.qr = PRODUCT_IDS.QR;
  }

  public onCardClick($event: any) {
    this.onProductCardClick.emit(this.productContext.productId);
  }

  public isUserProduct(productId: number) {
    let ret = false;
    this.prdList.forEach(prdId => {
      if (prdId.toString() === productId.toString()) {
        ret = true;
      }
    });
    return ret;
  }

  public getRtpProductStatsCount(productId: number) {
    this._prdSvc.getRtpProductStatsCount(productId).subscribe((stat: IApiResponseBackend) => {
      if(stat.Data) {
        this.rtpStats = stat.Data;
      }
    });
  }

  ngOnInit() {
    this.prdList = this._vaultService.get('assessableProducts').split('|');
    if (this.productContext.productId === PRODUCT_IDS.CPSRTP) {
      this.getRtpProductStatsCount(PRODUCT_IDS.CPSRTP);
    }
  }
}
