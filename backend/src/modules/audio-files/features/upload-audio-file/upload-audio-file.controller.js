import { StatusCodes } from 'http-status-codes';
import { BadRequestError, PayloadTooLargeError } from '#src/utils/index.js';
import { MULTIPART_MAX_FILE_BYTES } from '#src/plugins/multipart.plugin.js';
import { uploadAudioFileService } from '#src/modules/audio-files/features/upload-audio-file/upload-audio-file.service.js';

const FILE_FIELD_NAME = 'file';

async function readUploadedFile(request) {
  let file;

  try {
    file = await request.file();
  } catch {
    throw new BadRequestError('Choose an audio file to upload');
  }

  if (!file || file.fieldname !== FILE_FIELD_NAME) {
    throw new BadRequestError('Choose an audio file to upload');
  }

  try {
    return {
      buffer: await file.toBuffer(),
      fileName: file.filename,
      contentType: file.mimetype,
      title: file.fields.title?.value,
    };
  } catch (error) {
    if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
      throw new PayloadTooLargeError(
        `Use an audio file under ${MULTIPART_MAX_FILE_BYTES / 1024 / 1024} MB`,
      );
    }

    throw error;
  }
}

export async function uploadAudioFileController(request, reply) {
  const upload = await readUploadedFile(request);

  const audioFile = await uploadAudioFileService({
    storage: request.server.storage,
    audio: request.server.audio,
    log: request.log,
    userId: request.user._id,
    ...upload,
  });

  return reply.success({
    data: { audioFile },
    message: 'Audio uploaded',
    statusCode: StatusCodes.CREATED,
  });
}
