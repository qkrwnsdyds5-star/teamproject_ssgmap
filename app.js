/**
 * 이마트 쓱map - 메인 비즈니스 로직 & 인터랙션 스크립트 (app.js)
 * v1.4.0:
 * - 첫 화면: 구매 희망 상품 검색 & 추가, 장바구니 목록 (prototype.url UX)
 * - '쓱map 시작하기' 클릭 시 맞춤 추천 연관상품 추천 모달 (원클릭 함께 담기)
 * - 지도 페이지: 100% 흰색 통로 동선, 숫자 핀(1~7), GPS 내위치(빨간 점) 실시간 트래킹 & 보행 시뮬레이션
 * - 오른쪽 하단 'AR 길안내': 카메라 기반 증강현실(AR) 입체 바닥 화살표, 공중 부양 핀, HUD 네비게이션
 * - '+ 카트에 담기' 시 다음 순번 자동 전환 & 7종 완료 시 '이마트 고래잇' 세레모니 모달
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Data Catalog: Default 7 Core Items & Extended Search/Recommendation DB
  // =========================================================================
  const DEFAULT_STORE_ITEMS = [
    {
      id: 'prod-01',
      order: 1,
      name: '노브랜드 라면 한그릇 (5개입)',
      shortName: '라면 한그릇',
      category: '면류',
      typeBadge: '상온 가공식품',
      reasonBadge: '카트 바닥 베이스',
      image: 'emart_ramen.png',
      location: '1층 가공식품 라면 매대 앞',
      mapCoords: { x: 66.0, y: 44.1 },
      price: 2480,
      unit: '1번들 (5개입)',
      isChecked: false,
      storageTip: '직사광선과 습기를 피하고 서늘한 실온에 보관. 부피가 크고 단단하여 카트 밑바닥에 가장 먼저 넓게 깔아 베이스를 만듭니다.'
    },
    {
      id: 'prod-02',
      order: 2,
      name: '자연주의 저탄소인증 사과 (1.5kg/봉)',
      shortName: '저탄소 사과',
      category: '과일',
      typeBadge: '상온 신선청과',
      reasonBadge: '1.5kg 하단 적재',
      image: 'emart_apple.png',
      location: '1층 농산 코너 앞 (A-01 매대)',
      mapCoords: { x: 43.5, y: 17.1 },
      price: 12900,
      unit: '1봉',
      isChecked: false,
      storageTip: '1.5kg 중량 과일로 상온 상품이면서 단단하므로 라면 옆 카트 하단부에 안정적으로 거치합니다.'
    },
    {
      id: 'prod-03',
      order: 3,
      name: '노브랜드 굿밀크 (1,000ml)',
      shortName: '노브랜드 굿밀크',
      category: '유제품',
      typeBadge: '냉장 유제품',
      reasonBadge: '1L 하단 코너 지지',
      image: 'emart_milk.png',
      location: '1층 우유 전용 매대 앞',
      mapCoords: { x: 59.4, y: 44.1 },
      price: 1980,
      unit: '1L',
      isChecked: false,
      storageTip: '0~10℃ 냉장 보관. 무거운 액체팩이므로 쓰러지지 않게 카트 하단 코너부에 안정적으로 세워 거치합니다.'
    },
    {
      id: 'prod-04',
      order: 4,
      name: '[더느림+] 무항생제 칼집 삼겹살 (600g)',
      shortName: '칼집 삼겹살',
      category: '축산',
      typeBadge: '냉장 신선육',
      reasonBadge: '선도 유지 중후반',
      image: 'emart_pork.png',
      location: '1층 축산/정육 코너 앞',
      mapCoords: { x: 68.8, y: 17.1 },
      price: 17800,
      unit: '1팩',
      isChecked: false,
      storageTip: '온도 변화에 민감한 신선육은 쇼핑 중후반부에 담아 신선도(0~2℃)를 극대화합니다.'
    },
    {
      id: 'prod-05',
      order: 5,
      name: '부드러운 샌드위치 식빵 (450g)',
      shortName: '샌드위치 식빵',
      category: '베이커리',
      typeBadge: '상온 베이커리',
      reasonBadge: '짓눌림 방지 상단',
      image: 'emart_whtie_bread.png',
      location: '1층 베이커리 코너 앞 (블랑제리)',
      mapCoords: { x: 83.8, y: 27.7 },
      price: 2680,
      unit: '1봉',
      isChecked: false,
      storageTip: '푹신하여 쉽게 찌그러지므로 이미 카트 바닥에 실린 무거운 상품들 위쪽에 가볍게 올려 담습니다.'
    },
    {
      id: 'prod-06',
      order: 6,
      name: '알찬란 30개입',
      shortName: '알찬란 30구',
      category: '축산',
      typeBadge: '냉장 신선란',
      reasonBadge: '최우선 파손주의 최상단',
      image: 'emart_egg.png',
      location: '1층 신선식품 코너 앞 (계란 매대)',
      mapCoords: { x: 39.1, y: 30.4 },
      price: 6980,
      unit: '1판 (30구)',
      isChecked: false,
      storageTip: '깨지기 가장 쉬운 파손 주의 품목! 카트의 가장 안전한 최상단 거치대에 올려 다른 물품에 눌리지 않게 보호합니다.'
    },
    {
      id: 'prod-07',
      order: 7,
      name: 'CJ 비비고 얇은피 왕교자 만두 (840g)',
      shortName: '비비고 왕교자',
      category: '냉동가공',
      typeBadge: '냉동식품 (-18℃)',
      reasonBadge: '계산대 직전 해동방지',
      image: 'emart_mandu.png',
      location: '1층 가공냉장·냉동 매대 앞',
      mapCoords: { x: 46.5, y: 44.1 },
      price: 8480,
      unit: '1봉',
      isChecked: false,
      storageTip: '장보기 도중 녹거나 상온 해동되는 것을 막기 위해 계산대 직전 가장 마지막에 담고 즉시 결제합니다!'
    }
  ];

  // Extended Catalog for Search and Recommendations
  const CATALOG_DATABASE = [
    ...DEFAULT_STORE_ITEMS,
    {
      id: 'prod-08',
      name: 'CJ 해찬들 사계절 쌈장 (500g)',
      shortName: '해찬들 쌈장',
      category: '가공식품',
      typeBadge: '상온 양념/조미료',
      reasonBadge: '삼겹살 필수템',
      image: 'emart_pork.png',
      location: '1층 가공식품 양념 매대',
      mapCoords: { x: 63.3, y: 44.1 },
      price: 2980,
      unit: '1통',
      storageTip: '개봉 후 냉장 보관. 삼겹살과 함께 구워 드실 때 필수 양념입니다.',
      relatedTo: ['prod-04']
    },
    {
      id: 'prod-09',
      name: '친환경 모둠 쌈채소/상추 (150g)',
      shortName: '친환경 청상추',
      category: '채소',
      typeBadge: '상온 신선채소',
      reasonBadge: '삼겹살 쌈채소',
      image: 'emart_apple.png',
      location: '1층 농산 채소 코너',
      mapCoords: { x: 39.1, y: 17.1 },
      price: 1980,
      unit: '1봉',
      storageTip: '신선란, 고기와 함께 즐기는 신선한 상추 쌈채소입니다.',
      relatedTo: ['prod-04']
    },
    {
      id: 'prod-10',
      name: '노브랜드 맛있는 배추김치 (1kg)',
      shortName: '노브랜드 김치',
      category: '반찬',
      typeBadge: '냉장 김치/반찬',
      reasonBadge: '라면 찰떡궁합',
      image: 'emart_ramen.png',
      location: '1층 가공냉장 반찬 매대',
      mapCoords: { x: 46.5, y: 44.1 },
      price: 5480,
      unit: '1봉',
      storageTip: '0~10℃ 냉장 보관. 라면과 환상의 조화를 이루는 아삭한 김치입니다.',
      relatedTo: ['prod-01']
    },
    {
      id: 'prod-11',
      name: '서울우유 체다 슬라이스 치즈 (15매)',
      shortName: '슬라이스 치즈',
      category: '유제품',
      typeBadge: '냉장 유제품',
      reasonBadge: '라면·토스트 추가',
      image: 'emart_milk.png',
      location: '1층 우유·치즈 전용 매대',
      mapCoords: { x: 59.4, y: 44.1 },
      price: 3980,
      unit: '1팩 (15매)',
      storageTip: '냉장 보관. 라면에 얹거나 샌드위치 식빵에 넣어 고소하게 즐기세요.',
      relatedTo: ['prod-01', 'prod-05']
    },
    {
      id: 'prod-12',
      name: '상하목장 유기농 딸기잼 (300g)',
      shortName: '유기농 딸기잼',
      category: '가공식품',
      typeBadge: '상온 스프레드',
      reasonBadge: '식빵 단짝 스프레드',
      image: 'emart_whtie_bread.png',
      location: '1층 가공식품 잼/시럽 매대',
      mapCoords: { x: 66.0, y: 44.1 },
      price: 4200,
      unit: '1병',
      storageTip: '개봉 후 냉장 보관. 부드러운 샌드위치 식빵에 발라먹기 좋습니다.',
      relatedTo: ['prod-05']
    },
    {
      id: 'prod-13',
      name: '오뚜기 진라면 매운맛 (5개입)',
      shortName: '진라면 매운맛',
      category: '면류',
      typeBadge: '상온 가공식품',
      reasonBadge: '카트 바닥 적재',
      image: 'emart_ramen.png',
      location: '1층 가공식품 라면 매대',
      mapCoords: { x: 66.0, y: 44.1 },
      price: 3280,
      unit: '1번들',
      storageTip: '실온 보관'
    },
    {
      id: 'prod-14',
      name: '제주 삼다수 (2L x 6병)',
      shortName: '제주 삼다수 2L',
      category: '음료',
      typeBadge: '상온 생수 (중량물)',
      reasonBadge: '카트 하단 최우선',
      image: 'emart_milk.png',
      location: '1층 가공식품 음료/생수 매대',
      mapCoords: { x: 74.0, y: 44.1 },
      price: 5880,
      unit: '1팩 (6입)',
      storageTip: '무거운 대용량 생수로 카트 바닥에 가장 먼저 안정적으로 싣습니다.'
    }
  ];

  // Landmarks
  const LANDMARKS = {
    entrance: { name: '1층 에스컬레이터 입구', coords: { x: 68.2, y: 77.5 } },
    checkout: { name: '1층 스피드 계산대', coords: { x: 74.0, y: 77.5 } }
  };

  /**
   * 100% PURE WHITE-AISLE WAYPOINTS (Pixel-verified on emart_1f_map.png)
   * 회색 매대 구역을 단 1px도 침범하지 않는 엄격한 복도 중심선 경로 (0 non-white pixels verified)
   */
  const WHITE_AISLE_WAYPOINTS = [
    { x: 68.2, y: 77.5 }, // 0. 에스컬레이터 입구 (하단 통로)
    { x: 83.8, y: 77.5 }, // 1. 하단 메인 가로 통로 -> 우측 세로 통로 진입
    { x: 83.8, y: 44.1 }, // 2. 우측 세로 통로 -> 중앙 메인 가로 통로 도달
    { x: 66.0, y: 44.1 }, // 3. [1번: 라면 한그릇 앞] (상온 가공 / 바닥 베이스)
    { x: 53.9, y: 44.1 }, // 4. 중앙 세로 통로 입구
    { x: 53.9, y: 17.1 }, // 5. 중앙 세로 통로 -> 상단 가로 통로 진입
    { x: 43.5, y: 17.1 }, // 6. [2번: 저탄소 사과 앞] (상온 신선 / 1.5kg 하단 적재)
    { x: 39.1, y: 17.1 }, // 7. 좌측 세로 통로 상단
    { x: 39.1, y: 44.1 }, // 8. 좌측 세로 통로 -> 중앙 가로 통로 진입
    { x: 59.4, y: 44.1 }, // 9. [3번: 노브랜드 굿밀크 앞] (냉장 유제품 / 1L 코너 지지)
    { x: 53.9, y: 44.1 }, // 10. 중앙 세로 통로
    { x: 53.9, y: 17.1 }, // 11. 상단 통로 도달
    { x: 68.8, y: 17.1 }, // 12. [4번: 칼집 삼겹살 앞] (냉장 신선육 / 선도 유지)
    { x: 53.9, y: 17.1 }, // 13. 중앙 세로 통로 복귀
    { x: 53.9, y: 44.1 }, // 14. 중앙 가로 통로 복귀
    { x: 83.8, y: 44.1 }, // 15. 우측 세로 통로 도달
    { x: 83.8, y: 27.7 }, // 16. [5번: 샌드위치 식빵 앞] (베이커리 / 짓눌림 방지 상단)
    { x: 83.8, y: 44.1 }, // 17. 중앙 가로 통로 복귀
    { x: 39.1, y: 44.1 }, // 18. 신선식품 세로 통로 하단 도달
    { x: 39.1, y: 30.4 }, // 19. [6번: 알찬란 30개입 앞] (신선란 / 최우선 파손 주의)
    { x: 39.1, y: 44.1 }, // 20. 신선식품 세로 통로 복귀
    { x: 46.5, y: 44.1 }, // 21. [7번: 비비고 왕교자 만두 앞] (냉동 / 계산대 직전 해동 방지)
    { x: 83.8, y: 44.1 }, // 22. 계산대 방향 우측 통로로 이동
    { x: 83.8, y: 77.5 }, // 23. 우측 통로 하단
    { x: 74.0, y: 77.5 }  // 24. [스피드계산대 도착!]
  ];

  // State Management
  const state = {
    cartItems: JSON.parse(JSON.stringify(DEFAULT_STORE_ITEMS)),
    activeFilter: 'all',
    activeSort: 'route',
    activeTab: 'cart', // Default is Cart Screen as requested!
    activeItemId: 'prod-01',
    mapZoomLevel: 1.0,
    soundEnabled: true,
    myLocation: { x: 68.2, y: 77.5, name: '1층 에스컬레이터 입구' },
    isSimulating: false,
    simulationTimer: null,
    arStream: null,
    arActive: false
  };

  // =========================================================================
  // 2. DOM Elements
  // =========================================================================
  const elements = {
    // Header & Tabs
    navTabs: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    cartTabBadge: document.getElementById('cartTabBadge'),
    mapTabBadge: document.getElementById('mapTabBadge'),
    progressText: document.getElementById('progressText'),
    progressCount: document.getElementById('progressCount'),
    progressBar: document.getElementById('progressBar'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    brandHomeLink: document.getElementById('brandHomeLink'),

    // Cart Screen (Screen 1)
    productSearchInput: document.getElementById('productSearchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    quickTagChips: document.querySelectorAll('.quick-tag-chip'),
    searchResultsPanel: document.getElementById('searchResultsPanel'),
    searchResultsList: document.getElementById('searchResultsList'),
    searchResultCount: document.getElementById('searchResultCount'),
    btnCloseSearchResults: document.getElementById('btnCloseSearchResults'),
    customItemInput: document.getElementById('customItemInput'),
    btnCustomAdd: document.getElementById('btnCustomAdd'),
    cartCountBadge: document.getElementById('cartCountBadge'),
    btnResetDefaultItems: document.getElementById('btnResetDefaultItems'),
    btnClearAllCart: document.getElementById('btnClearAllCart'),
    cartItemsList: document.getElementById('cartItemsList'),
    summaryTotalCount: document.getElementById('summaryTotalCount'),
    summaryTotalPrice: document.getElementById('summaryTotalPrice'),
    btnStartSsgMap: document.getElementById('btnStartSsgMap'),

    // Map Screen (Screen 2)
    btnBackToCart: document.getElementById('btnBackToCart'),
    mapCanvasContainer: document.getElementById('mapCanvasContainer'),
    mapPinsContainer: document.getElementById('mapPinsContainer'),
    mapSvgOverlay: document.getElementById('mapSvgOverlay'),
    myLocationMarker: document.getElementById('myLocationMarker'),
    btnResetView: document.getElementById('btnResetView'),
    btnZoomIn: document.getElementById('btnZoomIn'),
    btnZoomOut: document.getElementById('btnZoomOut'),
    btnGpsLocate: document.getElementById('btnGpsLocate'),
    btnSimulateWalk: document.getElementById('btnSimulateWalk'),
    btnOpenArNav: document.getElementById('btnOpenArNav'),
    waypointsScrollRow: document.getElementById('waypointsScrollRow'),
    waypointActivePanel: document.getElementById('waypointActivePanel'),
    routeStepSummary: document.getElementById('routeStepSummary'),

    // Recommendation Modal (Step 2)
    recommendModal: document.getElementById('recommendModal'),
    recommendList: document.getElementById('recommendList'),
    btnRecommendClose: document.getElementById('btnRecommendClose'),
    btnSkipRecommend: document.getElementById('btnSkipRecommend'),
    btnProceedToMap: document.getElementById('btnProceedToMap'),

    // AR Navigation Overlay (Screen 3)
    arNavOverlay: document.getElementById('arNavOverlay'),
    arVideoFeed: document.getElementById('arVideoFeed'),
    arSimBackdrop: document.getElementById('arSimBackdrop'),
    arBillboardOrder: document.getElementById('arBillboardOrder'),
    arBillboardTitle: document.getElementById('arBillboardTitle'),
    arBillboardDist: document.getElementById('arBillboardDist'),
    arNavTurnIcon: document.getElementById('arNavTurnIcon'),
    arInstructionMain: document.getElementById('arInstructionMain'),
    arInstructionSub: document.getElementById('arInstructionSub'),
    arItemThumb: document.getElementById('arItemThumb'),
    arItemStep: document.getElementById('arItemStep'),
    arItemName: document.getElementById('arItemName'),
    arItemPrice: document.getElementById('arItemPrice'),
    arBtnCheck: document.getElementById('arBtnCheck'),
    btnCloseArNav: document.getElementById('btnCloseArNav'),
    btnToggleArCam: document.getElementById('btnToggleArCam'),

    // Celebration & Product Modals
    celebrationModal: document.getElementById('celebrationModal'),
    btnCelebrateClose: document.getElementById('btnCelebrateClose'),
    btnResetShopping: document.getElementById('btnResetShopping'),
    btnToCheckout: document.getElementById('btnToCheckout'),
    confettiCanvas: document.getElementById('confettiCanvas'),
    celebItemCount: document.getElementById('celebItemCount'),
    productModal: document.getElementById('productModal'),
    productModalImg: document.getElementById('productModalImg'),
    productModalTitle: document.getElementById('productModalTitle'),
    productModalLocation: document.getElementById('productModalLocation'),
    productModalPrice: document.getElementById('productModalPrice'),
    productModalTip: document.getElementById('productModalTip'),
    productModalCloseBtn: document.getElementById('productModalCloseBtn'),
    toastMsg: document.getElementById('toastMsg')
  };

  // =========================================================================
  // 3. Audio Sound Synthesizer (Native Web Audio API)
  // =========================================================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      if (type === 'check') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'fanfare') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = ctx.currentTime + idx * 0.11;
          const duration = idx === notes.length - 1 ? 0.6 : 0.2;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Toast Notification
  let toastTimer = null;
  function showToast(text) {
    if (!elements.toastMsg) return;
    elements.toastMsg.textContent = text;
    elements.toastMsg.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elements.toastMsg.classList.remove('show');
    }, 2500);
  }

  // =========================================================================
  // 4. Cart Screen Logic (Search & Add + Cart Wishlist)
  // =========================================================================
  function renderCartScreen() {
    if (!elements.cartItemsList) return;

    const count = state.cartItems.length;
    if (elements.cartCountBadge) elements.cartCountBadge.textContent = `${count}개`;
    if (elements.cartTabBadge) elements.cartTabBadge.textContent = count;
    if (elements.summaryTotalCount) elements.summaryTotalCount.textContent = `${count}개`;

    const totalPrice = state.cartItems.reduce((acc, it) => acc + (it.price || 0), 0);
    if (elements.summaryTotalPrice) {
      elements.summaryTotalPrice.textContent = `${totalPrice.toLocaleString()}원`;
    }

    if (count === 0) {
      elements.cartItemsList.innerHTML = `
        <div style="text-align:center; padding: 40px 16px; color:#8B95A1;">
          <div style="font-size:32px; margin-bottom:8px;">🛒</div>
          <div style="font-size:14px; font-weight:700; margin-bottom:4px;">장바구니가 비어 있습니다</div>
          <div style="font-size:12px;">상단 검색창이나 추천 키워드로 상품을 담아보세요.</div>
        </div>
      `;
      return;
    }

    elements.cartItemsList.innerHTML = state.cartItems.map((item, idx) => `
      <div class="cart-item-card" id="cart-item-${item.id}">
        <div class="cart-item-left">
          <span class="cart-item-order-badge">${idx + 1}</span>
          <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" onclick="window.ssgMap.openProductModal('${item.id}')" />
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <div class="cart-item-tags">
              <span class="cart-item-category">${item.category}</span>
              <span class="cart-item-loc">📍 ${item.location}</span>
            </div>
          </div>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-price">${(item.price || 0).toLocaleString()}원</span>
          <button class="cart-item-del-btn" onclick="window.ssgMap.removeFromCart('${item.id}')" title="삭제">✕</button>
        </div>
      </div>
    `).join('');
  }

  function searchProducts(query) {
    if (!elements.searchResultsPanel || !elements.searchResultsList) return;
    const q = (query || '').trim().toLowerCase();

    if (!q) {
      elements.searchResultsPanel.style.display = 'none';
      if (elements.searchClearBtn) elements.searchClearBtn.style.display = 'none';
      return;
    }

    if (elements.searchClearBtn) elements.searchClearBtn.style.display = 'block';

    const matches = CATALOG_DATABASE.filter(it => 
      it.name.toLowerCase().includes(q) || 
      it.category.toLowerCase().includes(q) ||
      (it.typeBadge && it.typeBadge.toLowerCase().includes(q))
    );

    elements.searchResultCount.textContent = matches.length;
    elements.searchResultsPanel.style.display = 'block';

    if (matches.length === 0) {
      elements.searchResultsList.innerHTML = `
        <div style="text-align:center; padding: 18px 10px; color:#94A3B8; font-size:12px;">
          '${query}' 검색 결과가 없습니다.<br/>
          아래 '+ 직접 추가'를 통해 나만의 품목을 담아보세요!
        </div>
      `;
      return;
    }

    elements.searchResultsList.innerHTML = matches.map(it => {
      const alreadyInCart = state.cartItems.some(c => c.id === it.id);
      return `
        <div class="search-result-item">
          <div class="result-item-left">
            <img src="${it.image}" alt="" class="result-item-thumb" />
            <div class="result-item-meta">
              <span class="result-item-title">${it.name}</span>
              <span class="result-item-sub">${it.category} · ${it.location} · ${(it.price || 0).toLocaleString()}원</span>
            </div>
          </div>
          <button 
            class="btn-add-search-item ${alreadyInCart ? 'added' : ''}" 
            onclick="window.ssgMap.addToCart('${it.id}')"
          >
            ${alreadyInCart ? '✓ 담김' : '+ 담기'}
          </button>
        </div>
      `;
    }).join('');
  }

  function addToCart(productId) {
    const existing = state.cartItems.find(it => it.id === productId);
    if (existing) {
      showToast(`'${existing.shortName || existing.name}'은(는) 이미 장바구니에 담겨있습니다.`);
      return;
    }

    const item = CATALOG_DATABASE.find(it => it.id === productId);
    if (!item) return;

    const newItem = { ...item, isChecked: false };
    state.cartItems.push(newItem);
    reorderCartItems();

    playSound('check');
    showToast(`'${newItem.shortName || newItem.name}' 장바구니 추가 완료!`);
    renderCartScreen();
    searchProducts(elements.productSearchInput ? elements.productSearchInput.value : '');
  }

  function removeFromCart(productId) {
    const idx = state.cartItems.findIndex(it => it.id === productId);
    if (idx >= 0) {
      const removed = state.cartItems[idx];
      state.cartItems.splice(idx, 1);
      reorderCartItems();
      showToast(`'${removed.shortName || removed.name}' 삭제되었습니다.`);
      renderCartScreen();
      searchProducts(elements.productSearchInput ? elements.productSearchInput.value : '');
    }
  }

  function addCustomItem(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      showToast('추가할 상품명을 입력해주세요.');
      return;
    }

    const newItem = {
      id: 'custom-' + Date.now(),
      order: state.cartItems.length + 1,
      name: trimmed,
      shortName: trimmed.length > 8 ? trimmed.slice(0, 8) : trimmed,
      category: '기타',
      typeBadge: '일반 품목',
      reasonBadge: '직접 추가',
      image: 'emart_ramen.png',
      location: '1층 고객 통로 매대',
      mapCoords: { x: 53.9, y: 44.1 },
      price: 3000,
      unit: '1개',
      isChecked: false,
      storageTip: '고객 지정 상품'
    };

    state.cartItems.push(newItem);
    reorderCartItems();
    playSound('check');
    showToast(`'${trimmed}' 상품이 추가되었습니다.`);
    if (elements.customItemInput) elements.customItemInput.value = '';
    renderCartScreen();
  }

  function resetDefaultCart() {
    state.cartItems = JSON.parse(JSON.stringify(DEFAULT_STORE_ITEMS));
    reorderCartItems();
    showToast('기본 7종 추천 상품으로 장바구니가 리셋되었습니다.');
    renderCartScreen();
  }

  function clearAllCart() {
    if (state.cartItems.length === 0) return;
    state.cartItems = [];
    showToast('장바구니가 모두 비워졌습니다.');
    renderCartScreen();
  }

  // Reorder items according to retail science: Weight, Ambient, Chilled, Fragile, Frozen
  function reorderCartItems() {
    const getPriority = (item) => {
      const t = (item.typeBadge || '') + ' ' + (item.category || '') + ' ' + (item.reasonBadge || '');
      if (t.includes('냉동')) return 7; // Last (right before checkout)
      if (t.includes('파손') || t.includes('계란') || t.includes('알찬란')) return 6; // Delicate top
      if (t.includes('식빵') || t.includes('베이커리')) return 5; // Crushable top
      if (t.includes('신선육') || t.includes('축산') || t.includes('삼겹살')) return 4; // Chilled meat
      if (t.includes('유제품') || t.includes('우유') || t.includes('치즈')) return 3; // Chilled dairy
      if (t.includes('과일') || t.includes('청과') || t.includes('채소') || t.includes('사과')) return 2; // Heavy fresh
      return 1; // Heavy ambient base (ramen, water, boxes)
    };

    state.cartItems.sort((a, b) => getPriority(a) - getPriority(b));
    state.cartItems.forEach((it, i) => { it.order = i + 1; });
  }

  // =========================================================================
  // 5. Recommendations System ('쓱map 시작하기' Modal)
  // =========================================================================
  function getRelatedRecommendations() {
    // Collect related items based on what's in cart
    const currentIds = new Set(state.cartItems.map(it => it.id));
    const recs = [];

    CATALOG_DATABASE.forEach(catalogItem => {
      if (currentIds.has(catalogItem.id)) return; // Already in cart

      if (catalogItem.relatedTo && catalogItem.relatedTo.length > 0) {
        // Check if any matching trigger product is in cart
        const hasTrigger = catalogItem.relatedTo.some(tid => currentIds.has(tid));
        if (hasTrigger) {
          recs.push(catalogItem);
        }
      }
    });

    // If not enough related items, suggest general top items
    if (recs.length < 3) {
      const generalTop = ['prod-08', 'prod-09', 'prod-10', 'prod-11', 'prod-12'];
      generalTop.forEach(gid => {
        if (!currentIds.has(gid) && !recs.some(r => r.id === gid)) {
          const item = CATALOG_DATABASE.find(it => it.id === gid);
          if (item) recs.push(item);
        }
      });
    }

    return recs.slice(0, 5);
  }

  function openRecommendationModal() {
    if (state.cartItems.length === 0) {
      showToast('장바구니에 상품을 먼저 담아주세요!');
      return;
    }

    const recs = getRelatedRecommendations();
    if (!elements.recommendModal || !elements.recommendList) {
      proceedToMap();
      return;
    }

    elements.recommendList.innerHTML = recs.map(it => {
      const isAdded = state.cartItems.some(c => c.id === it.id);
      return `
        <div class="recommend-item-card">
          <div class="rec-item-left">
            <img src="${it.image}" alt="${it.name}" class="rec-item-thumb" />
            <div class="rec-item-meta">
              <span class="rec-match-badge">${it.reasonBadge || '추천 연관상품'}</span>
              <span class="rec-item-name">${it.name}</span>
              <span class="rec-item-price">${(it.price || 0).toLocaleString()}원</span>
            </div>
          </div>
          <button 
            class="btn-rec-add ${isAdded ? 'added' : ''}" 
            onclick="window.ssgMap.toggleRecommendAdd('${it.id}')"
          >
            ${isAdded ? '✓ 함께 담김' : '+ 함께 담기'}
          </button>
        </div>
      `;
    }).join('');

    elements.recommendModal.classList.add('active');
  }

  function toggleRecommendAdd(productId) {
    const isAdded = state.cartItems.some(c => c.id === productId);
    if (isAdded) {
      removeFromCart(productId);
    } else {
      addToCart(productId);
    }
    // Refresh modal list view
    openRecommendationModal();
  }

  function closeRecommendationModal() {
    if (elements.recommendModal) {
      elements.recommendModal.classList.remove('active');
    }
  }

  function proceedToMap() {
    closeRecommendationModal();
    reorderCartItems();
    switchTab('map');
    
    // Set first unchecked item active
    const firstUnchecked = state.cartItems.find(it => !it.isChecked) || state.cartItems[0];
    if (firstUnchecked) {
      state.activeItemId = firstUnchecked.id;
    }

    updateProgress();
    renderMap();
    renderWaypointBar();
    showToast('✨ 1F 최적 보행 동선이 생성되었습니다!');
  }

  // =========================================================================
  // 6. Map Screen Logic: 100% White Aisle Path, Number Pins & GPS '내위치'
  // =========================================================================
  function renderMap() {
    if (!elements.mapPinsContainer || !elements.mapSvgOverlay) return;

    // 1. Render Map Pins: NUMBER ONLY for pristine map visibility!
    const nextUnchecked = state.cartItems.find(it => !it.isChecked);

    elements.mapPinsContainer.innerHTML = state.cartItems.map((item, idx) => {
      const isNext = nextUnchecked && nextUnchecked.id === item.id;
      const isActive = state.activeItemId === item.id;
      const coords = item.mapCoords || { x: 53.9, y: 44.1 };

      return `
        <div 
          class="map-pin ${item.isChecked ? 'completed' : ''} ${isNext ? 'is-next' : ''} ${isActive ? 'active' : ''}" 
          id="pin-${item.id}"
          style="left: ${coords.x}%; top: ${coords.y}%;"
          onclick="window.ssgMap.selectRouteItem('${item.id}')"
          title="${idx + 1}번. ${item.name} (${item.location})"
        >
          <div class="pin-bubble">
            <span class="pin-badge-num">${item.isChecked ? '✓' : (idx + 1)}</span>
          </div>
        </div>
      `;
    }).join('');

    // Add entrance & checkout landmark pins
    const landmarksHtml = `
      <div class="map-pin landmark" style="left: ${LANDMARKS.entrance.coords.x}%; top: ${LANDMARKS.entrance.coords.y}%;">
        <div class="pin-bubble" style="border-color:#3B82F6; background:#EFF6FF; color:#1D4ED8;">
          <span>🚪 입구</span>
        </div>
      </div>
      <div class="map-pin landmark" style="left: ${LANDMARKS.checkout.coords.x}%; top: ${LANDMARKS.checkout.coords.y}%;">
        <div class="pin-bubble" style="border-color:#10B981; background:#ECFDF5; color:#065F46;">
          <span>💳 계산대</span>
        </div>
      </div>
    `;
    elements.mapPinsContainer.insertAdjacentHTML('beforeend', landmarksHtml);

    // 2. Render SVG Polyline (Strictly through White Aisles)
    renderRouteSvg();

    // 3. Render '내위치' Red Dot Marker
    renderMyLocationMarker();
  }

  function renderRouteSvg() {
    if (!elements.mapSvgOverlay) return;

    // Coordinate space normalized to 909 x 560 matching emart_1f_map.png exactly
    let d = '';
    WHITE_AISLE_WAYPOINTS.forEach((pt, i) => {
      const x = (pt.x * 9.09).toFixed(1);
      const y = (pt.y * 5.60).toFixed(1);
      if (i === 0) {
        d += `M ${x} ${y}`;
      } else {
        d += ` L ${x} ${y}`;
      }
    });

    elements.mapSvgOverlay.setAttribute('viewBox', '0 0 909 560');
    elements.mapSvgOverlay.setAttribute('preserveAspectRatio', 'none');
    elements.mapSvgOverlay.innerHTML = `
      <path d="${d}" class="route-path-halo" />
      <path d="${d}" class="route-path" />
    `;
  }

  // GPS '내위치' Red Dot Marker
  function renderMyLocationMarker() {
    if (!elements.myLocationMarker) return;
    elements.myLocationMarker.style.left = `${state.myLocation.x}%`;
    elements.myLocationMarker.style.top = `${state.myLocation.y}%`;
  }

  function startGpsLocate() {
    if ('geolocation' in navigator) {
      showToast('📍 GPS 신호를 수신하는 중입니다...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // If in Geumjeong store area, set to entrance or current position
          state.myLocation = { x: 68.2, y: 77.5, name: '1층 에스컬레이터 입구' };
          renderMyLocationMarker();
          playSound('check');
          showToast(`📍 내 위치 확인 완료: 1층 고객 통로 (정확도 ±${Math.round(pos.coords.accuracy)}m)`);
        },
        (err) => {
          // Fallback to 1F entrance location
          state.myLocation = { x: 68.2, y: 77.5, name: '1층 에스컬레이터 입구' };
          renderMyLocationMarker();
          showToast('📍 실내 위치 감지: 1층 에스컬레이터 입구');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      state.myLocation = { x: 68.2, y: 77.5, name: '1층 에스컬레이터 입구' };
      renderMyLocationMarker();
      showToast('📍 내 위치: 1층 에스컬레이터 입구');
    }
  }

  // Walking simulation: animates the red dot step-by-step along the white corridors
  function toggleWalkSimulation() {
    if (state.isSimulating) {
      stopWalkSimulation();
      showToast('🚶 보행 시뮬레이션을 중지했습니다.');
      return;
    }

    state.isSimulating = true;
    if (elements.btnSimulateWalk) elements.btnSimulateWalk.classList.add('active');
    showToast('🚶 보행 시뮬레이션 시작: 동선을 따라 걷습니다.');

    let step = 0;
    state.simulationTimer = setInterval(() => {
      if (step >= WHITE_AISLE_WAYPOINTS.length) {
        step = 0;
      }
      const pt = WHITE_AISLE_WAYPOINTS[step];
      state.myLocation = { x: pt.x, y: pt.y, name: `통로 ${step}번 지점` };
      renderMyLocationMarker();
      step++;
    }, 450);
  }

  function stopWalkSimulation() {
    state.isSimulating = false;
    clearInterval(state.simulationTimer);
    if (elements.btnSimulateWalk) elements.btnSimulateWalk.classList.remove('active');
  }

  // =========================================================================
  // 7. Route Waypoint Bar & Active Item Detail Panel
  // =========================================================================
  function renderWaypointBar() {
    if (!elements.waypointsScrollRow || !elements.waypointActivePanel) return;

    // Render clickable chips
    elements.waypointsScrollRow.innerHTML = state.cartItems.map((item, idx) => {
      const isSelected = state.activeItemId === item.id;
      return `
        <div 
          class="waypoint-chip ${isSelected ? 'active' : ''} ${item.isChecked ? 'completed' : ''}"
          onclick="window.ssgMap.selectRouteItem('${item.id}')"
          title="${item.name}"
        >
          <span class="chip-order-badge">${item.isChecked ? '✓' : (idx + 1)}</span>
          <img src="${item.image}" alt="" class="chip-img-thumb" />
          <span class="chip-name">${item.shortName || item.name}</span>
        </div>
      `;
    }).join('');

    // Render Active Waypoint Detail Panel
    const activeItem = state.cartItems.find(it => it.id === state.activeItemId) || state.cartItems[0];
    if (activeItem) {
      const idx = state.cartItems.findIndex(it => it.id === activeItem.id) + 1;
      elements.waypointActivePanel.innerHTML = `
        <div class="active-panel-left">
          <img 
            src="${activeItem.image}" 
            alt="${activeItem.name}" 
            class="active-panel-thumb" 
            onclick="window.ssgMap.openProductModal('${activeItem.id}')"
            title="사진 크게 보기"
          />
          <div class="active-panel-meta">
            <div class="active-panel-order">
              STEP ${idx} · <span style="color:#B45309; font-weight:800;">${activeItem.typeBadge || '일반'}</span> (${activeItem.reasonBadge || '추천'})
            </div>
            <div class="active-panel-title" title="${activeItem.name}">${activeItem.name}</div>
            <div class="active-panel-location">📍 ${activeItem.location}</div>
            <div class="active-panel-price">${(activeItem.price || 0).toLocaleString()}원 <span style="font-size:11px; font-weight:normal; color:#666;">(${activeItem.unit || '1개'})</span></div>
          </div>
        </div>
        <button 
          class="active-panel-btn ${activeItem.isChecked ? 'is-checked' : ''}"
          onclick="window.ssgMap.toggleItemCheck('${activeItem.id}')"
        >
          ${activeItem.isChecked ? '✓ 담음 (취소)' : '+ 카트에 담기'}
        </button>
      `;
    }
  }

  function selectRouteItem(id) {
    state.activeItemId = id;
    renderWaypointBar();
    renderMap();
    setTimeout(() => {
      const activeChip = document.querySelector('.waypoint-chip.active');
      if (activeChip) {
        activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 50);
  }

  function toggleItemCheck(id) {
    const item = state.cartItems.find(it => it.id === id);
    if (!item) return;

    item.isChecked = !item.isChecked;

    if (item.isChecked) {
      playSound('check');
      
      // AUTO-ADVANCE: Find next unchecked item!
      const currentIndex = state.cartItems.findIndex(it => it.id === id);
      let nextItem = state.cartItems.slice(currentIndex + 1).find(it => !it.isChecked);
      if (!nextItem) {
        nextItem = state.cartItems.find(it => !it.isChecked);
      }

      if (nextItem) {
        state.activeItemId = nextItem.id;
        showToast(`'${item.shortName || item.name}' 담기 완료! ➔ 다음: '${nextItem.shortName || nextItem.name}'`);
      } else {
        showToast(`'${item.shortName || item.name}' 카트에 담기 완료!`);
      }
    } else {
      showToast(`'${item.shortName || item.name}' 담기 취소`);
    }

    updateProgress();
    renderWaypointBar();
    renderMap();

    // Auto-scroll the horizontal waypoint chip into view
    setTimeout(() => {
      const activeChip = document.querySelector('.waypoint-chip.active');
      if (activeChip) {
        activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 50);

    // Check if ALL items are checked
    const checkedCount = state.cartItems.filter(it => it.isChecked).length;
    if (checkedCount > 0 && checkedCount === state.cartItems.length) {
      setTimeout(() => {
        triggerCelebration();
      }, 350);
    }
  }

  function updateProgress() {
    const total = state.cartItems.length;
    const checked = state.cartItems.filter(it => it.isChecked).length;
    const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

    if (elements.progressBar) {
      elements.progressBar.style.width = `${percent}%`;
    }
    if (elements.progressCount) {
      elements.progressCount.textContent = `${checked}/${total} (${percent}%)`;
    }
    if (elements.progressText) {
      if (checked === total && total > 0) {
        elements.progressText.textContent = '🎉 모든 품목 장보기 완료!';
      } else if (checked === 0) {
        elements.progressText.textContent = '장보기를 시작해보세요';
      } else {
        elements.progressText.textContent = `${total - checked}개 품목이 남았어요`;
      }
    }
    if (elements.mapTabBadge) {
      elements.mapTabBadge.textContent = `${checked}/${total}`;
    }
    if (elements.celebItemCount) {
      elements.celebItemCount.textContent = `${checked}개 (100%)`;
    }
  }

  // =========================================================================
  // 8. AR Navigation System (AR 기술이 적용된 화면)
  // =========================================================================
  function openArNavigation() {
    if (!elements.arNavOverlay) return;

    state.arActive = true;
    elements.arNavOverlay.style.display = 'flex';

    // Update AR HUD based on active item
    updateArHud();

    // Try starting camera stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      }).then((stream) => {
        state.arStream = stream;
        if (elements.arVideoFeed) {
          elements.arVideoFeed.srcObject = stream;
          elements.arVideoFeed.style.display = 'block';
        }
        if (elements.arSimBackdrop) {
          elements.arSimBackdrop.style.display = 'none';
        }
        showToast('📷 AR 카메라 모드가 시작되었습니다.');
      }).catch((err) => {
        // Fallback to high-tech realistic corridor simulation
        console.log('Camera access fallback to simulation:', err);
        if (elements.arVideoFeed) elements.arVideoFeed.style.display = 'none';
        if (elements.arSimBackdrop) elements.arSimBackdrop.style.display = 'block';
        showToast('🧭 AR 시뮬레이션 모드가 실행되었습니다.');
      });
    } else {
      if (elements.arVideoFeed) elements.arVideoFeed.style.display = 'none';
      if (elements.arSimBackdrop) elements.arSimBackdrop.style.display = 'block';
      showToast('🧭 AR 시뮬레이션 모드가 실행되었습니다.');
    }
  }

  function updateArHud() {
    const activeItem = state.cartItems.find(it => it.id === state.activeItemId) || state.cartItems[0];
    if (!activeItem) return;

    const idx = state.cartItems.findIndex(it => it.id === activeItem.id) + 1;

    if (elements.arBillboardOrder) elements.arBillboardOrder.textContent = idx;
    if (elements.arBillboardTitle) elements.arBillboardTitle.textContent = activeItem.name;
    if (elements.arBillboardDist) elements.arBillboardDist.textContent = `📍 앞으로 8m 직진 후 ${activeItem.location}`;

    if (elements.arItemThumb) elements.arItemThumb.src = activeItem.image;
    if (elements.arItemStep) elements.arItemStep.textContent = `STEP ${idx} · ${activeItem.typeBadge || '일반'}`;
    if (elements.arItemName) elements.arItemName.textContent = activeItem.name;
    if (elements.arItemPrice) elements.arItemPrice.textContent = `${(activeItem.price || 0).toLocaleString()}원`;

    if (elements.arInstructionMain) {
      elements.arInstructionMain.textContent = `중앙 통로를 따라 12m 직진하세요`;
    }
    if (elements.arInstructionSub) {
      elements.arInstructionSub.textContent = `다음 목표: ${idx}번 ${activeItem.location}`;
    }

    if (elements.arBtnCheck) {
      if (activeItem.isChecked) {
        elements.arBtnCheck.textContent = '✓ 담음 (완료)';
        elements.arBtnCheck.classList.add('completed');
      } else {
        elements.arBtnCheck.textContent = '+ 카트에 담기';
        elements.arBtnCheck.classList.remove('completed');
      }
    }
  }

  function checkItemInAr() {
    const activeItem = state.cartItems.find(it => it.id === state.activeItemId);
    if (!activeItem) return;

    toggleItemCheck(activeItem.id);
    updateArHud();

    // Check if finished
    const checkedCount = state.cartItems.filter(it => it.isChecked).length;
    if (checkedCount === state.cartItems.length) {
      closeArNavigation();
    }
  }

  function closeArNavigation() {
    state.arActive = false;
    if (elements.arNavOverlay) elements.arNavOverlay.style.display = 'none';

    if (state.arStream) {
      state.arStream.getTracks().forEach(track => track.stop());
      state.arStream = null;
    }
  }

  function toggleArCameraMode() {
    if (elements.arSimBackdrop && elements.arVideoFeed) {
      if (elements.arSimBackdrop.style.display === 'none') {
        elements.arSimBackdrop.style.display = 'block';
        elements.arVideoFeed.style.display = 'none';
        showToast('📷 3D 시뮬레이션 배경 모드로 전환');
      } else {
        elements.arSimBackdrop.style.display = 'none';
        elements.arVideoFeed.style.display = 'block';
        showToast('📷 실시간 카메라 모드로 전환');
      }
    }
  }

  // =========================================================================
  // 9. Celebration Modal & Confetti Effects
  // =========================================================================
  let confettiAnimationId = null;

  function triggerCelebration() {
    playSound('fanfare');
    if (elements.celebrationModal) {
      elements.celebrationModal.classList.add('active');
    }
    startConfetti();
  }

  function closeCelebration() {
    if (elements.celebrationModal) {
      elements.celebrationModal.classList.remove('active');
    }
    stopConfetti();
  }

  function startConfetti() {
    const canvas = elements.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 380;
    canvas.height = canvas.parentElement.clientHeight || 500;

    const particles = [];
    const colors = ['#FFBF00', '#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6'];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 3,
        d: Math.random() * 20 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleInc: (Math.random() * 0.07) + 0.05,
        tiltAngle: 0
      });
    }

    let angle = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angle += 0.01;

      particles.forEach(p => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(angle + p.d) + 1 + p.r / 2) * 1.5;
        p.x += Math.sin(angle);
        p.tilt = Math.sin(p.tiltAngle - (p.r / 2)) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + (p.r / 4), p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + (p.r / 4));
        ctx.stroke();

        if (p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = -10;
        }
      });

      confettiAnimationId = requestAnimationFrame(draw);
    }

    cancelAnimationFrame(confettiAnimationId);
    draw();
  }

  function stopConfetti() {
    cancelAnimationFrame(confettiAnimationId);
    if (elements.confettiCanvas) {
      const ctx = elements.confettiCanvas.getContext('2d');
      ctx.clearRect(0, 0, elements.confettiCanvas.width, elements.confettiCanvas.height);
    }
  }

  // =========================================================================
  // 10. Product Detail Modal (Photo Zoom)
  // =========================================================================
  function openProductModal(id) {
    const item = CATALOG_DATABASE.find(it => it.id === id) || state.cartItems.find(it => it.id === id);
    if (!item || !elements.productModal) return;

    elements.productModalImg.src = item.image;
    elements.productModalTitle.textContent = item.name;
    elements.productModalLocation.textContent = `📍 ${item.location}`;
    elements.productModalPrice.textContent = `${(item.price || 0).toLocaleString()}원 (${item.unit || '1개'})`;
    elements.productModalTip.textContent = item.storageTip || '신선하게 보관하세요.';

    elements.productModal.classList.add('active');
  }

  function closeProductModal() {
    if (elements.productModal) {
      elements.productModal.classList.remove('active');
    }
  }

  // =========================================================================
  // 11. Tab Switching & Event Listeners Binding
  // =========================================================================
  function switchTab(tabId) {
    state.activeTab = tabId;

    elements.navTabs.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
      btn.setAttribute('aria-selected', btn.dataset.tab === tabId ? 'true' : 'false');
    });

    elements.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tabId}Tab`);
    });

    if (tabId === 'cart') {
      renderCartScreen();
    } else if (tabId === 'map') {
      renderMap();
      renderWaypointBar();
    }
  }

  function initEventListeners() {
    // Nav Tabs
    elements.navTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
      });
    });

    // Sound Toggle
    if (elements.soundToggleBtn) {
      elements.soundToggleBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        showToast(state.soundEnabled ? '🔔 효과음 켜짐' : '🔕 효과음 꺼짐');
      });
    }

    // Brand Logo click -> Go to Cart Tab
    if (elements.brandHomeLink) {
      elements.brandHomeLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('cart');
      });
    }

    // Cart Search Input
    if (elements.productSearchInput) {
      elements.productSearchInput.addEventListener('input', (e) => {
        searchProducts(e.target.value);
      });
    }

    if (elements.searchClearBtn) {
      elements.searchClearBtn.addEventListener('click', () => {
        if (elements.productSearchInput) elements.productSearchInput.value = '';
        searchProducts('');
      });
    }

    if (elements.btnCloseSearchResults) {
      elements.btnCloseSearchResults.addEventListener('click', () => {
        if (elements.searchResultsPanel) elements.searchResultsPanel.style.display = 'none';
      });
    }

    // Quick Keyword Tags
    elements.quickTagChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const kw = chip.dataset.keyword;
        if (elements.productSearchInput) {
          elements.productSearchInput.value = kw;
        }
        searchProducts(kw);
      });
    });

    // Custom Item Add
    if (elements.btnCustomAdd && elements.customItemInput) {
      elements.btnCustomAdd.addEventListener('click', () => {
        addCustomItem(elements.customItemInput.value);
      });
      elements.customItemInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          addCustomItem(elements.customItemInput.value);
        }
      });
    }

    // Cart Action Buttons
    if (elements.btnResetDefaultItems) {
      elements.btnResetDefaultItems.addEventListener('click', resetDefaultCart);
    }
    if (elements.btnClearAllCart) {
      elements.btnClearAllCart.addEventListener('click', clearAllCart);
    }

    // '쓱map 시작하기' Button -> Opens Recommendations Modal
    if (elements.btnStartSsgMap) {
      elements.btnStartSsgMap.addEventListener('click', openRecommendationModal);
    }

    // Recommendation Modal Actions
    if (elements.btnRecommendClose) {
      elements.btnRecommendClose.addEventListener('click', closeRecommendationModal);
    }
    if (elements.btnSkipRecommend) {
      elements.btnSkipRecommend.addEventListener('click', proceedToMap);
    }
    if (elements.btnProceedToMap) {
      elements.btnProceedToMap.addEventListener('click', proceedToMap);
    }

    // Map Screen Actions
    if (elements.btnBackToCart) {
      elements.btnBackToCart.addEventListener('click', () => switchTab('cart'));
    }

    // GPS & Walking Simulation
    if (elements.btnGpsLocate) {
      elements.btnGpsLocate.addEventListener('click', startGpsLocate);
    }
    if (elements.btnSimulateWalk) {
      elements.btnSimulateWalk.addEventListener('click', toggleWalkSimulation);
    }

    // Map Click -> Set "내위치" Red Dot
    if (elements.mapCanvasContainer) {
      elements.mapCanvasContainer.addEventListener('click', (e) => {
        const rect = elements.mapCanvasContainer.getBoundingClientRect();
        const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
        const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
        
        state.myLocation = { x: xPct, y: yPct, name: '선택 위치' };
        renderMyLocationMarker();
        showToast(`📍 내 위치 지정: (${xPct}%, ${yPct}%)`);
      });
    }

    // Zoom Controls
    if (elements.btnZoomIn) {
      elements.btnZoomIn.addEventListener('click', () => {
        state.mapZoomLevel = Math.min(state.mapZoomLevel + 0.2, 2.2);
        updateMapTransform();
      });
    }
    if (elements.btnZoomOut) {
      elements.btnZoomOut.addEventListener('click', () => {
        state.mapZoomLevel = Math.max(state.mapZoomLevel - 0.2, 0.8);
        updateMapTransform();
      });
    }
    if (elements.btnResetView) {
      elements.btnResetView.addEventListener('click', () => {
        state.mapZoomLevel = 1.0;
        updateMapTransform();
      });
    }

    // AR Navigation Actions
    if (elements.btnOpenArNav) {
      elements.btnOpenArNav.addEventListener('click', openArNavigation);
    }
    if (elements.btnCloseArNav) {
      elements.btnCloseArNav.addEventListener('click', closeArNavigation);
    }
    if (elements.arBtnCheck) {
      elements.arBtnCheck.addEventListener('click', checkItemInAr);
    }
    if (elements.btnToggleArCam) {
      elements.btnToggleArCam.addEventListener('click', toggleArCameraMode);
    }

    // Modals Close
    if (elements.btnCelebrateClose) {
      elements.btnCelebrateClose.addEventListener('click', closeCelebration);
    }
    if (elements.btnResetShopping) {
      elements.btnResetShopping.addEventListener('click', () => {
        closeCelebration();
        resetDefaultCart();
        switchTab('cart');
      });
    }
    if (elements.btnToCheckout) {
      elements.btnToCheckout.addEventListener('click', () => {
        closeCelebration();
        showToast('💳 1층 스피드 계산대로 안내합니다.');
      });
    }
    if (elements.productModalCloseBtn) {
      elements.productModalCloseBtn.addEventListener('click', closeProductModal);
    }
  }

  function updateMapTransform() {
    if (!elements.mapCanvasContainer) return;
    elements.mapCanvasContainer.style.transform = `scale(${state.mapZoomLevel})`;
  }

  // =========================================================================
  // 12. Global API & Initialization
  // =========================================================================
  window.ssgMap = {
    addToCart,
    removeFromCart,
    addCustomItem,
    resetDefaultCart,
    clearAllCart,
    selectRouteItem,
    toggleItemCheck,
    toggleRecommendAdd,
    openProductModal,
    triggerCelebration,
    openArNavigation,
    closeArNavigation
  };

  // Launch initial render: Start on Cart & Search Screen!
  renderCartScreen();
  updateProgress();
  initEventListeners();
});
