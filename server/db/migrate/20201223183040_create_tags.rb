class CreateTags < ActiveRecord::Migration[6.1]
  def change
    create_table :tags do |t|
      t.references :image, type: :string, unique: true, null: false
      t.string :kind
      t.string :value
      t.integer :count

      t.timestamps
    end
  end
end
