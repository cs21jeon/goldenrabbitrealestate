// 에어테이블 API를 이용하여 매물 데이터를 가져오는 함수
async function fetchPropertiesFromAirtable() {
    const baseId = 'appGSg5QfDNKgFf73';
    const tableId = 'tblnR438TK52Gr0HB';
    const viewId = 'viweFlrK1v4aXqYH8';
    const apiKey = 'pat7olc5Gz7qkrUm7.8e86080895b1e58dd6ec4ffcf1b482d03cb36f837f7d6aa0b90b319e2ffdf58b';
    
    try {
      // 실제 운영 환경에서는 프록시 서버를 사용해야 합니다.
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}?view=${viewId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }
      
      const data = await response.json();
      return data.records;
    } catch (error) {
      console.error('에어테이블 데이터 가져오기 실패:', error);
      return [];
    }
  }
  
  // 매물 데이터를 화면에 표시하는 함수
  function renderProperties(properties) {
    const propertiesGrid = document.querySelector('.properties-grid');
    
    // 로딩 메시지 제거
    propertiesGrid.innerHTML = '';
    
    if (properties.length === 0) {
      propertiesGrid.innerHTML = '<div class="no-properties">현재 등록된 매물이 없습니다.</div>';
      return;
    }
    
    // 필드 구조 확인을 위해 첫 번째 레코드 콘솔에 출력
    if (properties.length > 0) {
      console.log('첫 번째 레코드의 필드:', properties[0].fields);
      console.log('첫 번째 레코드의 ID:', properties[0].id);
    }
    
    // 각 매물에 대한 카드 생성
    properties.forEach(property => {
      const fields = property.fields;
      const recordId = property.id; // 레코드 ID 저장
      
      // 필요한 데이터 추출 및 가공
      const address = fields['지번 주소'] || '주소 정보 없음';
      const priceInWon = fields['매가(만원)'] || 0;
      const priceInBillion = (priceInWon / 10000).toFixed(1).replace('.0', '');
      const landArea = fields['토지면적(㎡)'] || 0;
      const buildingArea = fields['연면적(㎡)'] || 0;
      const buildYear = fields['사용승인일'] ? fields['사용승인일'].substring(0, 4) : '';
      
      // 대표사진 URL 추출 (첫 번째 첨부 파일의 URL 사용)
      let photoUrl = '/api/placeholder/400/300';  // 기본 이미지
      
      // 대표사진 필드가 있는지 확인
      if (fields['대표사진'] && Array.isArray(fields['대표사진']) && fields['대표사진'].length > 0) {
        // 첨부 파일 형식인 경우 (배열로 제공됨)
        photoUrl = fields['대표사진'][0].url;
      } else if (fields['사진링크']) {
        // 사진링크 필드가 있는 경우 (문자열로 제공됨)
        const photoLinks = fields['사진링크'].split(',');
        if (photoLinks.length > 0 && photoLinks[0].trim()) {
          photoUrl = photoLinks[0].trim();
        }
      }
      
      // 매물 카드 생성
      const propertyCard = document.createElement('div');
      propertyCard.className = 'property-card';
      propertyCard.innerHTML = `
        <div class="property-image" style="background-image: url('${photoUrl}');"></div>
        <div class="property-info">
          <div class="property-title">${address}</div>
          <div class="property-price">${priceInBillion}억원</div>
          <div class="property-features">
            <div class="feature">대지면적: ${landArea}㎡</div>
            <div class="feature">연면적: ${buildingArea}㎡</div>
            <div class="feature">연식: ${buildYear}년</div>
          </div>
        </div>
      `;
      
      // 클릭 이벤트 추가 - 상세 정보 표시
      propertyCard.addEventListener('click', () => showPropertyDetails(fields, recordId));
      
      propertiesGrid.appendChild(propertyCard);
    });
  }
  
  // 매물 상세 정보를 모달로 표시하는 함수
  function showPropertyDetails(property, recordId) {
    // 모달 생성 또는 가져오기
    let modalBackground = document.getElementById('modalBackground');
    if (!modalBackground) {
      modalBackground = document.createElement('div');
      modalBackground.id = 'modalBackground';
      modalBackground.className = 'modal-background';
      document.body.appendChild(modalBackground);
      
      // 모달 닫기 이벤트
      modalBackground.addEventListener('click', (e) => {
        if (e.target === modalBackground) {
          closeModal();
        }
      });
    }
    
    // 모달 콘텐츠 생성
    const priceInWon = property['매가(만원)'] || 0;
    const priceInBillion = (priceInWon / 10000).toFixed(1).replace('.0', '');
    const buildYear = property['사용승인일'] ? property['사용승인일'].substring(0, 4) : '';
    
    // 대표사진 URL 추출
    let photoUrl = '/api/placeholder/800/400';  // 기본 이미지
    
    // 대표사진 필드가 있는지 확인
    if (property['대표사진'] && Array.isArray(property['대표사진']) && property['대표사진'].length > 0) {
      // 첨부 파일 형식인 경우 (배열로 제공됨)
      photoUrl = property['대표사진'][0].url;
    } else if (property['사진링크']) {
      // 사진링크 필드가 있는 경우 (문자열로 제공됨)
      const photoLinks = property['사진링크'].split(',');
      if (photoLinks.length > 0 && photoLinks[0].trim()) {
        photoUrl = photoLinks[0].trim();
      }
    }
    
    // 지번 주소 사용
    const address = property['지번 주소'] || '주소 정보 없음';
    
    // 에어테이블 레코드 링크 생성
    const airtableLink = `https://airtable.com/appGSg5QfDNKgFf73/shrMoyiS143vdYbYS?recordId=${recordId}`;

    // 모달 콘텐츠 HTML
    modalBackground.innerHTML = `
      <div class="modal-content">
        <div class="modal-close" onclick="closeModal()">×</div>
        <div class="modal-header">
          <div class="modal-image" style="background-image: url('${photoUrl}');"></div>
        </div>
        <div class="modal-body">
          <h2 class="modal-title">${address}</h2>
          <div class="modal-price">${priceInBillion}억원</div>
          
          <div class="modal-description">
            ${property['비고'] || ''} ${address} 위치의 매물입니다. 자세한 정보는 문의 바랍니다.
          </div>
          
          <div class="modal-details">
            <div class="detail-item">
              <div class="detail-label">대지면적</div>
              <div class="detail-value">${property['토지면적(㎡)'] || 0}㎡</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">연면적</div>
              <div class="detail-value">${property['연면적(㎡)'] || 0}㎡</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">준공년도</div>
              <div class="detail-value">${buildYear}년</div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="#contact" class="btn" onclick="closeModal()">문의하기</a>
            <a href="${airtableLink}" class="btn" style="margin-left: 10px; background-color: #4CAF50;" target="_blank">에어테이블에서 보기</a>
          </div>
        </div>
      </div>
    `;
    
    // 모달 표시
    modalBackground.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
  }
  
  // 모달 닫기 함수
  function closeModal() {
    const modalBackground = document.getElementById('modalBackground');
    if (modalBackground) {
      modalBackground.style.display = 'none';
      document.body.style.overflow = 'auto'; // 스크롤 허용
    }
  }
  
  // 페이지 로드 시 실행
  document.addEventListener('DOMContentLoaded', async function() {
    const propertiesSection = document.getElementById('properties');
    if (!propertiesSection) return;
    
    // 로딩 메시지 표시
    const propertiesGrid = propertiesSection.querySelector('.properties-grid') || propertiesSection.querySelector('.airtable-embed-container');
    if (propertiesGrid) {
      propertiesGrid.innerHTML = '<div class="loading-message">매물 정보를 불러오는 중입니다...</div>';
    } else {
      // properties-grid가 없으면 생성
      const container = propertiesSection.querySelector('.container');
      const propertiesGridNew = document.createElement('div');
      propertiesGridNew.className = 'properties-grid';
      propertiesGridNew.innerHTML = '<div class="loading-message">매물 정보를 불러오는 중입니다...</div>';
      
      // section-title 바로 다음에 추가
      const sectionTitle = propertiesSection.querySelector('.section-title');
      if (sectionTitle && sectionTitle.nextSibling) {
        container.insertBefore(propertiesGridNew, sectionTitle.nextSibling);
      } else {
        container.appendChild(propertiesGridNew);
      }
    }
    
    // 에어테이블 데이터 가져오기
    const properties = await fetchPropertiesFromAirtable();
    
    // 데이터 표시
    renderProperties(properties);
  });
  
  // 전역 함수로 노출
  window.closeModal = closeModal;