// 상담 문의 폼 제출 처리 스크립트
document.addEventListener('DOMContentLoaded', function() {
    const consultForm = document.getElementById('consultForm');
    const formStatus = document.getElementById('formStatus');
    
    if (consultForm) {
      consultForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 로딩 표시
        const submitButton = consultForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = '접수 중...';
        
        // 상태 메시지 표시
        formStatus.style.display = 'block';
        formStatus.textContent = '상담 문의를 접수 중입니다...';
        formStatus.style.color = '#666';
        
        // 폼 데이터 수집
        const propertyType = document.getElementById('propertyType').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value || '';
        const message = document.getElementById('message').value;
        
        try {
          // 서버리스 함수 호출 - 이 방식으로 통일
          const response = await fetch('/api/submit-inquiry', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              propertyType,
              phone,
              email,
              message
            })
          });
          
          // 응답 로깅 (디버깅용)
          console.log('서버 응답 상태:', response.status);
          const responseData = await response.json();
          console.log('서버 응답 데이터:', responseData);
          
          if (!response.ok) {
            throw new Error(`서버 요청 실패: ${response.status}`);
          }
          
          // 성공 메시지
          formStatus.textContent = '상담 신청이 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.';
          formStatus.style.color = 'green';
          consultForm.reset();
          
          // 5초 후 메시지 숨기기
          setTimeout(() => {
            formStatus.style.display = 'none';
          }, 5000);
          
        } catch (error) {
          console.error('상담 접수 실패:', error);
          
          // 오류 메시지
          formStatus.textContent = '상담 접수 중 오류가 발생했습니다. 전화로 문의해 주세요.';
          formStatus.style.color = 'red';
        } finally {
          // 버튼 상태 복원
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      });
    }
});