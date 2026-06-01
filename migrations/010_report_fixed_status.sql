-- Migration 010: Thêm status 'fixed' cho reports (admin đã sửa xong, chờ super admin xác nhận)
ALTER TABLE reports MODIFY COLUMN status ENUM('new','reviewing','flagged','fixed','resolved','rejected') NOT NULL DEFAULT 'new';
