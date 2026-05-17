from flask import Blueprint, request, jsonify, send_from_directory, current_app, Response
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from werkzeug.utils import secure_filename
from database import db, Video, User
import os
import uuid

videos_bp = Blueprint('videos', __name__)

ALLOWED_EXTENSIONS = {'mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@videos_bp.route('/', methods=['GET'])
def get_videos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)

    pagination = Video.query.order_by(Video.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'videos': [v.to_dict() for v in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@videos_bp.route('/<int:video_id>', methods=['GET'])
def get_video(video_id):
    video = Video.query.get_or_404(video_id)
    video.views += 1
    db.session.commit()
    return jsonify(video.to_dict()), 200


@videos_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_video():
    user_id = int(get_jwt_identity())

    if 'video' not in request.files:
        return jsonify({'error': 'Файл видео не найден'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'Файл не выбран'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Недопустимый формат файла'}), 400

    title = request.form.get('title', 'Без названия')
    description = request.form.get('description', '')

    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    video = Video(
        title=title,
        description=description,
        filename=filename,
        user_id=user_id
    )
    db.session.add(video)
    db.session.commit()

    return jsonify(video.to_dict()), 201


@videos_bp.route('/stream/<int:video_id>', methods=['GET'])
def stream_video(video_id):
    video = Video.query.get_or_404(video_id)
    upload_folder = current_app.config['UPLOAD_FOLDER']
    filepath = os.path.join(upload_folder, video.filename)

    if not os.path.exists(filepath):
        return jsonify({'error': 'Файл не найден'}), 404

    file_size = os.path.getsize(filepath)
    range_header = request.headers.get('Range', None)

    if range_header:
        byte_start, byte_end = 0, file_size - 1
        match = range_header.replace('bytes=', '').split('-')
        byte_start = int(match[0])
        if match[1]:
            byte_end = int(match[1])

        chunk_size = (byte_end - byte_start) + 1

        def generate():
            with open(filepath, 'rb') as f:
                f.seek(byte_start)
                remaining = chunk_size
                while remaining > 0:
                    chunk = f.read(min(8192, remaining))
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk

        ext = video.filename.rsplit('.', 1)[1].lower()
        mime = 'video/mp4' if ext == 'mp4' else f'video/{ext}'

        response = Response(
            generate(),
            206,
            mimetype=mime,
            direct_passthrough=True
        )
        response.headers['Content-Range'] = f'bytes {byte_start}-{byte_end}/{file_size}'
        response.headers['Accept-Ranges'] = 'bytes'
        response.headers['Content-Length'] = chunk_size
        return response

    return send_from_directory(upload_folder, video.filename)


@videos_bp.route('/<int:video_id>', methods=['DELETE'])
@jwt_required()
def delete_video(video_id):
    user_id = int(get_jwt_identity())
    video = Video.query.get_or_404(video_id)

    if video.user_id != user_id:
        return jsonify({'error': 'Нет доступа'}), 403

    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], video.filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    db.session.delete(video)
    db.session.commit()
    return jsonify({'message': 'Видео удалено'}), 200
