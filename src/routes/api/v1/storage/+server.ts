import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { fromIni } from "@aws-sdk/credential-provider-ini"
import { error } from "@sveltejs/kit"
import {
  AWS_REGION,
  AWS_ACCESS_KEY,
  AWS_SECRET,
  AWS_BUCKET_NAME,
} from "$env/static/private"

export const POST = async ({ request }): Promise<Response> => {
  // upload input file to aws s3 storage
  // 요청에서 FormData 파싱
  const formData = await request.formData()
  const file = formData.get("file") // 'file'은 input의 name 속성 값

  if (file && file instanceof File) {
    const { name, type, size } = file

    // Blob으로 변환
    const blob = new Blob([await file.arrayBuffer()], { type })

    // 파일 처리 로직 (예: 저장 또는 다른 처리)
    const path = "public/" + crypto.randomUUID() + "." + name.split(".").at(-1) // 랜덤한 파일 이름 생성
    const result = await safeUpload(blob, path)

    // 여기서는 간단히 파일 메타데이터를 반환
    return new Response(JSON.stringify({ name, path, type, size, result }))
  } else {
    // 파일이 없거나 유효하지 않은 경우 오류 반환
    throw error(400)
  }
}

// S3 클라이언트 초기화
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET,
  },
})

const maxAttempts = 3
async function safeUpload(blob: Blob, path: string) {
  let attempts = 0
  while (attempts < maxAttempts) {
    try {
      return await upload(blob, path) // 업로드가 성공하면 반복 중단
    } catch (error) {
      if ((error as Error)?.name === "SlowDown" && attempts < maxAttempts) {
        attempts++
        const delayTime = 1000 * (attempts - 1)
        const message = `Failed to upload By SlowDown, retry: ${attempts}, delay: ${delayTime}\n`

        console.warn(message)
        await delay(delayTime) // 딜레이 증가
      } else {
        console.error(`Failed to upload after all retries`, error, "\n\n")
        throw error // 재시도 후에도 실패하면 에러를 던짐
      }
    }
  }
}

async function upload(blob: Blob, path: string) {
  const fileStream = blob.stream()

  const uploader = new Upload({
    client: s3,
    params: {
      Bucket: AWS_BUCKET_NAME, // S3 버킷 이름
      Key: path, // S3에 저장될 파일 경로 및 이름
      Body: fileStream, // 업로드할 파일 데이터
      ContentType: blob.type, // 콘텐츠 유형 설정
    },
  })

  const response = await uploader.done()
  return response
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
