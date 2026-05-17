from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db, ChatMessage, Video

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/<int:video_id>', methods=['GET'])
def get_messages(video_id):
    Video.query.get_or_404(video_id)
    messages = ChatMessage.query.filter_by(video_id=video_id)\
        .order_by(ChatMessage.created_at.desc()).limit(100).all()
    return jsonify([m.to_dict() for m in reversed(messages)]), 200


@chat_bp.route('/<int:video_id>', methods=['POST'])
@jwt_required()
def send_message(video_id):
    user_id = int(get_jwt_identity())
    Video.query.get_or_404(video_id)

    data = request.get_json()
    if not data.get('content'):
        return jsonify({'error': 'Сообщение не может быть пустым'}), 400

    message = ChatMessage(
        content=data['content'],
        user_id=user_id,
        video_id=video_id,
        is_question=data.get('is_question', False)
    )
    db.session.add(message)
    db.session.commit()

    return jsonify(message.to_dict()), 201


@chat_bp.route('/like/<int:message_id>', methods=['POST'])
@jwt_required()
def like_message(message_id):
    message = ChatMessage.query.get_or_404(message_id)
    message.likes += 1
    db.session.commit()
    return jsonify(message.to_dict()), 200
