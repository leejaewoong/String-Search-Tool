import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import https from 'https';

// GA4 Measurement ID (환경 변수 또는 설정에서 가져오기)
const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const GA_API_SECRET = process.env.GA_API_SECRET || ''; // GA4 API Secret 필요

interface AnalyticsData {
  userId: string;
  firstInstalled: string;
  appVersion: string;
  totalSearches: number;
  totalGitPulls: number;
  languageUsage: Record<string, number>;
  features: {
    synonymsViews: number;
    translationsViews: number;
    detailViewOpens: number;
    predictedTranslationsViews: number;
  };
}

class AnalyticsService {
  private store: Store<AnalyticsData>;
  private userId: string;
  private isProduction: boolean;
  private ga4Enabled: boolean;

  constructor() {
    // 로컬 저장소 초기화
    this.store = new Store<AnalyticsData>({
      name: 'analytics',
      defaults: {
        userId: '',
        firstInstalled: new Date().toISOString(),
        appVersion: '1.0.0',
        totalSearches: 0,
        totalGitPulls: 0,
        languageUsage: {},
        features: {
          synonymsViews: 0,
          translationsViews: 0,
          detailViewOpens: 0,
          predictedTranslationsViews: 0,
        },
      },
    });

    // User ID 생성 또는 가져오기
    this.userId = this.getOrCreateUserId();

    // GA4 초기화 (프로덕션 모드에서만)
    this.isProduction = process.env.NODE_ENV === 'production';
    this.ga4Enabled = GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX' && GA_API_SECRET !== '' && this.isProduction;

    if (this.ga4Enabled) {
      console.log('[Analytics] GA4 enabled in production mode');
    } else if (!this.isProduction) {
      console.log('[Analytics] Development mode - GA4 disabled, local tracking only');
    } else if (GA_API_SECRET === '') {
      console.log('[Analytics] GA4 API Secret not configured');
    }
  }

  /**
   * 기기별 고유 ID 생성 (해시)
   */
  private getOrCreateUserId(): string {
    let userId = this.store.get('userId');

    if (!userId) {
      const uniqueId = uuidv4();
      userId = crypto.createHash('sha256').update(uniqueId).digest('hex').substring(0, 16);
      this.store.set('userId', userId);
    }

    return userId;
  }

  /**
   * GA4에 이벤트 전송 (Measurement Protocol v2)
   */
  private sendGA4Event(eventName: string, params: Record<string, any> = {}): void {
    if (!this.ga4Enabled) {
      console.log('[Analytics] GA4 not configured, skipping event:', eventName);
      return;
    }

    try {
      const payload = JSON.stringify({
        client_id: this.userId,
        events: [
          {
            name: eventName,
            params: {
              ...params,
              engagement_time_msec: '100',
            },
          },
        ],
      });

      const options = {
        hostname: 'www.google-analytics.com',
        port: 443,
        path: `/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res) => {
        if (res.statusCode === 204) {
          console.log('[Analytics] Event sent to GA4:', eventName, params);
        } else {
          console.error('[Analytics] GA4 responded with status:', res.statusCode);
        }
      });

      req.on('error', (error) => {
        console.error('[Analytics] Failed to send GA4 event:', error.message);
      });

      req.write(payload);
      req.end();
    } catch (error) {
      console.error('[Analytics] Failed to send GA4 event:', error);
    }
  }

  /**
   * 검색 이벤트 추적
   */
  trackSearch(language: string): void {
    // GA4 즉시 전송
    this.sendGA4Event('search', {
      language,
    });

    // 로컬 카운터 증가
    const totalSearches = this.store.get('totalSearches') + 1;
    this.store.set('totalSearches', totalSearches);

    const languageUsage = this.store.get('languageUsage');
    languageUsage[language] = (languageUsage[language] || 0) + 1;
    this.store.set('languageUsage', languageUsage);

    console.log('[Analytics] Search tracked:', language, 'Total:', totalSearches);
  }

  /**
   * Git Pull 이벤트 추적
   */
  trackGitPull(): void {
    // GA4 즉시 전송
    this.sendGA4Event('git_pull', {});

    // 로컬 카운터 증가
    const totalGitPulls = this.store.get('totalGitPulls') + 1;
    this.store.set('totalGitPulls', totalGitPulls);

    console.log('[Analytics] Git Pull tracked. Total:', totalGitPulls);
  }

  /**
   * 유의어 조회 이벤트 추적
   */
  trackSynonymsView(): void {
    // GA4 즉시 전송
    this.sendGA4Event('synonyms_view', {});

    // 로컬 카운터 증가
    const features = this.store.get('features');
    features.synonymsViews += 1;
    this.store.set('features', features);

    console.log('[Analytics] Synonyms view tracked:', features.synonymsViews);
  }

  /**
   * 번역 조회 이벤트 추적
   */
  trackTranslationsView(): void {
    // GA4 즉시 전송
    this.sendGA4Event('translations_view', {});

    // 로컬 카운터 증가
    const features = this.store.get('features');
    features.translationsViews += 1;
    this.store.set('features', features);

    console.log('[Analytics] Translations view tracked:', features.translationsViews);
  }

  /**
   * 상세 뷰 열기 이벤트 추적
   */
  trackDetailViewOpen(): void {
    // GA4 즉시 전송
    this.sendGA4Event('detail_view_open', {});

    // 로컬 카운터 증가
    const features = this.store.get('features');
    features.detailViewOpens += 1;
    this.store.set('features', features);

    console.log('[Analytics] Detail view open tracked:', features.detailViewOpens);
  }

  /**
   * AI 예상 번역 조회 이벤트 추적
   */
  trackPredictedTranslations(): void {
    // GA4 즉시 전송
    this.sendGA4Event('predicted_translations_view', {});

    // 로컬 카운터 증가
    const features = this.store.get('features');
    features.predictedTranslationsViews = (features.predictedTranslationsViews || 0) + 1;
    this.store.set('features', features);

    console.log('[Analytics] Predicted translations view tracked:', features.predictedTranslationsViews);
  }

  /**
   * 앱 버전 업데이트
   */
  setAppVersion(version: string): void {
    this.store.set('appVersion', version);
  }

  /**
   * 통계 데이터 가져오기
   */
  getAnalyticsData(): AnalyticsData {
    return this.store.store;
  }

  /**
   * 통계 데이터 초기화 (테스트용)
   */
  resetAnalytics(): void {
    this.store.clear();
    console.log('[Analytics] Analytics data reset');
  }
}

// 싱글톤 인스턴스
export const analyticsService = new AnalyticsService();
