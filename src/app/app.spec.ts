import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngxs/store';
import { App } from './app';
import { BandwidthService } from './features/recorder/services/bandwidth.service';
import { VideoStorageService } from './features/recorder/services/video-storage.service';
import { RecorderState } from './features/recorder/state/recorder.state';

describe('App', () => {
  const bandwidthService = {
    detect: () => ({ mbps: 3, quality: 'medium' as const, failed: false }),
  };
  const videoStorage = {
    loadAll: () => Promise.resolve([]),
    save: () => Promise.resolve(),
    delete: () => Promise.resolve(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideStore([RecorderState]),
        { provide: BandwidthService, useValue: bandwidthService },
        { provide: VideoStorageService, useValue: videoStorage },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: () => Promise.reject(new Error('No camera in unit tests')),
      },
    });
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the recorder surface', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.recorder-layout')).not.toBeNull();
    expect(compiled.textContent).toContain('There are no recorded videos yet');
  });
});
