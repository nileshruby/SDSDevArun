import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, DebugElement } from "@angular/core";
import { By } from "@angular/platform-browser";
import { PhoneNumberDirective } from './phoneNumber-directive';
@Component({
  template: `<input type="text" USPhoneFormat value="123654789">`
})
class TestHoverkeydownComponent {
}

describe('Directive: onFocus', () => {
  let component: TestHoverkeydownComponent;
  let fixture: ComponentFixture<TestHoverkeydownComponent>;
  let inputEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestHoverkeydownComponent, PhoneNumberDirective]
    });
    fixture = TestBed.createComponent(TestHoverkeydownComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));
  });

  it('should return empty string if the input value is empty and do the mouse hover', () => {
    inputEl.nativeElement.value = '';
    inputEl.triggerEventHandler('mouseover', null);
    fixture.detectChanges();
    expect(inputEl.nativeElement.value).toBe('');
  });

  it('should return correct format as (xxx) - when the input length is 2 and do mouse hover', () => {
    inputEl.nativeElement.value = 12;
    inputEl.triggerEventHandler('mouseover', null);
    fixture.detectChanges();
    expect(inputEl.nativeElement.value).toBe('(12');
  });

  it('should return correct format as (xxx) xxx-xxxx when the input length is 10 and do mouse hover', () => {
    inputEl.triggerEventHandler('mouseover', null);
    fixture.detectChanges();
    expect(inputEl.nativeElement.value).toBe('(123) 654-789');
  });

  it('should return empty if the value is empty when the key down', () => {
    inputEl.nativeElement.value = '';
    inputEl.triggerEventHandler('keydown', null);
    fixture.detectChanges();
    expect(inputEl.nativeElement.value).toBe('');
  });

  it('should return correct format as (xxx) - when the input length is 2 and do keydown', () => {
    inputEl.nativeElement.value = 12;
    inputEl.triggerEventHandler('keydown', null);
    fixture.detectChanges();
    expect(inputEl.nativeElement.value).toBe('(12');
  });

  it('should return correct format as (xxx) xxx-xxxx when the input length is 10 and do keydown', () => {
    inputEl.triggerEventHandler('keydown', null);
    fixture.detectChanges();
    expect(inputEl.nativeElement.value).toBe('(123) 654-789');
  });
});
