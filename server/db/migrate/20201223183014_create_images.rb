class CreateImages < ActiveRecord::Migration[6.1]
  def change
    create_table :images, id: :uuid do |t|
      t.string :shortlink
      t.string :file_name
      t.integer :file_size
      t.string :mime_type
      t.integer :width
      t.integer :height
      t.string :orientation
      t.string :title
      t.string :description
      t.boolean :private
      t.datetime :published_at
      t.timestamps
    end
  end
end
