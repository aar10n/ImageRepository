class CreateImages < ActiveRecord::Migration[6.1]
  def change
    create_table :images, id: :uuid do |t|
      t.binary :data
      t.string :file_name
      t.integer :file_size
      t.string :mime_type
      t.boolean :private
      t.boolean :uploaded
      t.string :shortlink

      t.timestamps
    end
  end
end
