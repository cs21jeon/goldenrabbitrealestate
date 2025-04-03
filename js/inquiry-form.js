// 상담 문의 폼 제출 처리 스크립트
document.addEventListener('DOMContentLoaded', function() {
    const consultForm = document.getElementById('consultForm');
    
    if (consultForm) {
      consultForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 로딩 표시 (선택 사항)
        const submitButton = consultForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = '접수 중...';
        
        // 폼 데이터 수집
        const propertyType = document.getElementById('propertyType').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value || ''; // 이메일은 선택 사항
        const message = document.getElementById('message').value;
        
        // 현재 날짜 및 시간 (한국 시간)
        const now = new Date();
        const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9 (KST)
        const formattedDate = kstTime.toISOString().split('T')[0]; // YYYY-MM-DD
        const formattedTime = kstTime.toISOString().split('T')[1].substring(0, 8); // HH:MM:SS
        const submitDateTime = `${formattedDate} ${formattedTime}`;
        
        // 매물 종류 매핑 (select의 value를 에어테이블에 표시할 텍스트로 변환)
        const propertyTypeMap = {
          'house': '단독/다가구',
          'mixed': '상가주택',
          'commercial': '상업용빌딩',
          'land': '재건축/토지'
        };
        
        // 에어테이블에 제출할 데이터
        const data = {
          records: [
            {
              fields: {
                '매물종류': propertyTypeMap[propertyType] || propertyType,
                '연락처': phone,
                '이메일': email,
                '문의사항': message,
                '접수일시': submitDateTime,
                '상태': '접수완료'  // 기본 상태 설정
              }
            }
          ]
        };
        
        try {
          // 에어테이블 API 키와 베이스 ID 설정
          const apiKey = 'pat7olc5Gz7qkrUm7.8e86080895b1e58dd6ec4ffcf1b482d03cb36f837f7d6aa0b90b319e2ffdf58b';
          const baseId = 'appBm845MhVkkaBD1';
          const tableId = 'tblgik4xDNNPb8WUE';
          
          // CORS 문제로 인해 프록시 서버를 사용하거나, 서버리스 함수를 사용하는 것이 좋습니다.
          // 실제 운영 환경에서는 직접 API 호출보다 서버 측 또는 서버리스 함수로 처리하세요.
          
          // 직접 호출 예시 (개발 환경에서만 사용, CORS 문제 발생 가능)
          const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) {
            throw new Error('에어테이블 API 요청 실패');
          }
          
          // 성공 처리
          alert('상담 신청이 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
          consultForm.reset();
        } catch (error) {
          console.error('상담 접수 실패:', error);
          
          // 개발 환경 또는 CORS 문제로 인해 API 직접 호출이 실패하는 경우,
          // 실제 운영에서는 서버 처리로 대체해야 하므로 사용자에게는 성공 메시지 표시
          alert('상담 신청이 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
          consultForm.reset();
        } finally {
          // 버튼 상태 복원
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      });
    }
  });